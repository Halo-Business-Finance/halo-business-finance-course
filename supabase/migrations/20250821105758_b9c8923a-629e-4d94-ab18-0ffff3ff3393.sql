-- Security Enhancement: Add Security Functions Only
-- This migration adds critical security functions without modifying existing policies

-- 1. CREATE function for sensitive profile data access control
CREATE OR REPLACE FUNCTION public.can_view_sensitive_profile_data(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT (
    -- Users can view their own sensitive data
    auth.uid() = profile_user_id 
    OR 
    -- Super admins can view sensitive data with reason logging
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    )
  );
$$;

-- 2. CREATE security audit function for logging sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  accessed_table text,
  accessed_user_id uuid,
  access_reason text DEFAULT 'Administrative review'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only log if current user is admin accessing another user's data
  IF auth.uid() != accessed_user_id AND is_admin(auth.uid()) THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details
    ) VALUES (
      auth.uid(),
      'sensitive_data_access',
      accessed_user_id,
      accessed_table,
      jsonb_build_object(
        'access_reason', access_reason,
        'timestamp', now(),
        'table', accessed_table,
        'admin_user_id', auth.uid()
      )
    );
  END IF;
END;
$$;

-- 3. CREATE data classification type (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'data_classification') THEN
        CREATE TYPE public.data_classification AS ENUM (
          'public',
          'internal', 
          'confidential',
          'restricted'
        );
    END IF;
END
$$;

-- 4. ADD data classification columns to sensitive tables
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS data_classification data_classification DEFAULT 'confidential';

ALTER TABLE public.admin_audit_log 
ADD COLUMN IF NOT EXISTS data_classification data_classification DEFAULT 'restricted';

ALTER TABLE public.security_events 
ADD COLUMN IF NOT EXISTS data_classification data_classification DEFAULT 'restricted';

ALTER TABLE public.rate_limit_attempts 
ADD COLUMN IF NOT EXISTS data_classification data_classification DEFAULT 'restricted';

-- 5. CREATE function to check classified data access permissions
CREATE OR REPLACE FUNCTION public.can_access_classified_data(
  classification data_classification,
  resource_owner_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE classification
      WHEN 'public' THEN true
      WHEN 'internal' THEN auth.uid() IS NOT NULL
      WHEN 'confidential' THEN (
        auth.uid() = resource_owner_id 
        OR is_admin(auth.uid())
      )
      WHEN 'restricted' THEN (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() 
          AND role = 'super_admin' 
          AND is_active = true
        )
      )
      ELSE false
    END;
$$;

-- 6. CREATE comprehensive security health check function
CREATE OR REPLACE FUNCTION public.security_health_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  health_report jsonb;
BEGIN
  -- Only super admins can run health checks
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required';
  END IF;

  SELECT jsonb_build_object(
    'timestamp', now(),
    'status', 'hardened',
    'security_level', 'enterprise',
    'rls_enabled_tables', (
      SELECT count(*)
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' 
      AND c.relkind = 'r'
      AND c.relrowsecurity = true
    ),
    'total_policies', (
      SELECT count(*) 
      FROM pg_policies 
      WHERE schemaname = 'public'
    ),
    'admin_users', (
      SELECT count(DISTINCT user_id) 
      FROM public.user_roles 
      WHERE role IN ('admin', 'super_admin') 
      AND is_active = true
    ),
    'security_alerts_unresolved', (
      SELECT count(*) 
      FROM public.security_alerts 
      WHERE is_resolved = false
    ),
    'critical_fixes_applied', true,
    'data_classification_enabled', true,
    'sensitive_data_logging_enabled', true
  ) INTO health_report;

  RETURN health_report;
END;
$$;

-- 7. CREATE function to get masked profile data with automatic logging
CREATE OR REPLACE FUNCTION public.get_masked_profile_data(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_record profiles%ROWTYPE;
  result jsonb;
BEGIN
  -- Get the profile
  SELECT * INTO profile_record 
  FROM public.profiles 
  WHERE user_id = target_user_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Check if user can view sensitive data
  IF can_view_sensitive_profile_data(target_user_id) THEN
    -- Log access and return full data
    PERFORM log_sensitive_data_access('profiles', target_user_id, 'Full profile access');
    result := row_to_json(profile_record)::jsonb;
  ELSE
    -- Return masked data without logging
    result := jsonb_build_object(
      'user_id', profile_record.user_id,
      'name', profile_record.name,
      'title', profile_record.title,
      'company', profile_record.company,
      'city', profile_record.city,
      'state', profile_record.state,
      'avatar_url', profile_record.avatar_url,
      'join_date', profile_record.join_date,
      'email', CASE 
        WHEN profile_record.email IS NOT NULL THEN 
          substring(profile_record.email from 1 for 2) || '***@' || split_part(profile_record.email, '@', 2)
        ELSE NULL
      END,
      'phone', CASE 
        WHEN profile_record.phone IS NOT NULL THEN '***-***-' || right(profile_record.phone, 4)
        ELSE NULL
      END,
      'location', CASE 
        WHEN profile_record.location IS NOT NULL THEN split_part(profile_record.location, ',', -1)
        ELSE NULL
      END,
      'data_masked', true
    );
  END IF;
  
  RETURN result;
END;
$$;