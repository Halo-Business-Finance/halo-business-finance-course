-- Fix Security Linter Warnings
-- This migration addresses the security definer view and search path issues

-- 1. Fix search_path for all functions to prevent security vulnerabilities
-- Update existing functions to have proper search_path settings

-- Fix log_profile_access function
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only log when admins access profile data (not when users access their own)
  IF auth.uid() != COALESCE(NEW.user_id, OLD.user_id) AND public.is_admin(auth.uid()) THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details
    ) VALUES (
      auth.uid(),
      'profile_data_modification',
      COALESCE(NEW.user_id, OLD.user_id),
      'profiles',
      jsonb_build_object(
        'access_type', TG_OP,
        'accessed_fields', CASE 
          WHEN TG_OP = 'UPDATE' THEN 'profile_modification'
          WHEN TG_OP = 'INSERT' THEN 'profile_creation'
          WHEN TG_OP = 'DELETE' THEN 'profile_deletion'
          ELSE TG_OP
        END,
        'timestamp', now(),
        'data_classification', 'confidential'
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix detect_unusual_profile_access function
CREATE OR REPLACE FUNCTION public.detect_unusual_profile_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  suspicious_admin RECORD;
  bulk_access_admin RECORD;
BEGIN
  -- Check for admins accessing unusually high number of profiles
  FOR bulk_access_admin IN
    SELECT 
      admin_user_id,
      COUNT(DISTINCT target_user_id) as profile_count,
      MAX(created_at) as last_access
    FROM public.admin_audit_log 
    WHERE action IN ('profile_data_access', 'profile_data_modification', 'sensitive_data_access')
      AND created_at > NOW() - INTERVAL '1 hour'
    GROUP BY admin_user_id
    HAVING COUNT(DISTINCT target_user_id) >= 20
  LOOP
    -- Create alert for bulk profile access
    PERFORM public.create_security_alert(
      'bulk_profile_access',
      'high',
      'Bulk Profile Data Access Detected',
      format('Admin user %s accessed %s different user profiles in the last hour', 
             bulk_access_admin.admin_user_id, bulk_access_admin.profile_count),
      jsonb_build_object(
        'admin_user_id', bulk_access_admin.admin_user_id,
        'profile_count', bulk_access_admin.profile_count,
        'last_access', bulk_access_admin.last_access,
        'risk_level', 'medium'
      )
    );
  END LOOP;

  -- Check for profile access outside business hours
  FOR suspicious_admin IN
    SELECT 
      admin_user_id,
      COUNT(*) as access_count,
      MIN(created_at) as first_access,
      MAX(created_at) as last_access
    FROM public.admin_audit_log 
    WHERE action IN ('profile_data_access', 'profile_data_modification', 'sensitive_data_access')
      AND created_at > NOW() - INTERVAL '24 hours'
      AND (
        EXTRACT(HOUR FROM created_at AT TIME ZONE 'EST') < 9 
        OR EXTRACT(HOUR FROM created_at AT TIME ZONE 'EST') > 18
        OR EXTRACT(DOW FROM created_at) IN (0, 6)
      )
    GROUP BY admin_user_id
    HAVING COUNT(*) >= 5
  LOOP
    -- Create alert for off-hours access
    PERFORM public.create_security_alert(
      'off_hours_profile_access',
      'medium',
      'Off-Hours Profile Access Detected',
      format('Admin user %s accessed %s user profiles outside business hours', 
             suspicious_admin.admin_user_id, suspicious_admin.access_count),
      jsonb_build_object(
        'admin_user_id', suspicious_admin.admin_user_id,
        'access_count', suspicious_admin.access_count,
        'first_access', suspicious_admin.first_access,
        'last_access', suspicious_admin.last_access,
        'risk_level', 'medium'
      )
    );
  END LOOP;
END;
$$;

-- Fix mask_sensitive_profile_data function
CREATE OR REPLACE FUNCTION public.mask_sensitive_profile_data(profile_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only mask data if user is not admin and not viewing their own data
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object(
      'id', profile_data->>'id',
      'name', CASE 
        WHEN profile_data->>'user_id' = auth.uid()::text THEN profile_data->>'name'
        ELSE '***'
      END,
      'title', profile_data->>'title',
      'company', profile_data->>'company',
      'city', profile_data->>'city',
      'state', profile_data->>'state',
      'email', CASE 
        WHEN profile_data->>'user_id' = auth.uid()::text THEN profile_data->>'email'
        ELSE '***@***.***'
      END,
      'phone', CASE 
        WHEN profile_data->>'user_id' = auth.uid()::text THEN profile_data->>'phone'
        ELSE '***-***-****'
      END
    );
  END IF;
  
  RETURN profile_data;
END;
$$;

-- Fix run_comprehensive_security_analysis function
CREATE OR REPLACE FUNCTION public.run_comprehensive_security_analysis()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Run existing security analysis
  PERFORM public.analyze_security_events();
  
  -- Run new profile access analysis
  PERFORM public.detect_unusual_profile_access();
  
  -- Log that analysis was run
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'security_analysis_completed',
    'low',
    jsonb_build_object(
      'timestamp', now(),
      'analysis_type', 'comprehensive',
      'triggered_by', 'periodic_check'
    )
  );
END;
$$;

-- Fix log_critical_security_event function
CREATE OR REPLACE FUNCTION public.log_critical_security_event(
  event_name text,
  severity_level text DEFAULT 'high',
  event_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    event_name,
    severity_level,
    event_details || jsonb_build_object(
      'timestamp', now(),
      'user_id', auth.uid(),
      'session_info', current_setting('request.headers', true)
    ),
    auth.uid()
  );
END;
$$;

-- Fix log_admin_profile_view function
CREATE OR REPLACE FUNCTION public.log_admin_profile_view(viewed_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only log if admin is viewing another user's profile
  IF public.is_admin(auth.uid()) AND auth.uid() != viewed_user_id THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details
    ) VALUES (
      auth.uid(),
      'profile_view_access',
      viewed_user_id,
      'profiles',
      jsonb_build_object(
        'access_type', 'SELECT',
        'accessed_fields', 'profile_view',
        'timestamp', now(),
        'data_classification', 'confidential'
      )
    );
  END IF;
END;
$$;

-- 2. Remove SECURITY DEFINER from safe_profiles view to fix the security definer view warning
-- Recreate the view without security definer, relying on RLS policies instead
DROP VIEW IF EXISTS public.safe_profiles;
CREATE VIEW public.safe_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  p.title,
  p.company,
  p.city,
  p.state,
  p.avatar_url,
  p.join_date,
  p.created_at
FROM public.profiles p;

-- The view now relies entirely on the RLS policies of the profiles table
-- Users will only see their own data, admins will see all data based on existing policies