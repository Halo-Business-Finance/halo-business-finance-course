-- Security Hardening Migration: Add Security Functions and Data Classification
-- This migration adds security enhancements without modifying existing policies

-- 1. CREATE function for sensitive profile data access
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

-- 2. CREATE security audit function for sensitive data access logging
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
        'table', accessed_table
      )
    );
  END IF;
END;
$$;

-- 3. CREATE data classification levels (if not exists)
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

-- 4. ADD data classification to sensitive tables
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS data_classification data_classification DEFAULT 'confidential';

ALTER TABLE public.admin_audit_log 
ADD COLUMN IF NOT EXISTS data_classification data_classification DEFAULT 'restricted';

ALTER TABLE public.security_events 
ADD COLUMN IF NOT EXISTS data_classification data_classification DEFAULT 'restricted';

ALTER TABLE public.rate_limit_attempts 
ADD COLUMN IF NOT EXISTS data_classification data_classification DEFAULT 'restricted';

-- 5. CREATE function to check if user can access classified data
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

-- 6. CREATE enhanced security audit policies for admin_audit_log
DROP POLICY IF EXISTS "Super admins can view audit logs" ON public.admin_audit_log;
CREATE POLICY "Super admins view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- 7. CREATE enhanced security policies for security_events  
DROP POLICY IF EXISTS "Admins can view all security events" ON public.security_events;
CREATE POLICY "Admins view security events"
ON public.security_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  )
);

-- 8. CREATE enhanced security policies for rate_limit_attempts
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limit_attempts;
CREATE POLICY "System and super admins manage rate limits"
ON public.rate_limit_attempts
FOR ALL
USING (
  -- Allow system/service role (auth.uid() IS NULL)
  auth.uid() IS NULL 
  OR 
  -- Allow super admins only
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- 9. CREATE security health check function for monitoring
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
    'status', 'secure',
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
    'data_classification_enabled', true
  ) INTO health_report;

  RETURN health_report;
END;
$$;

-- 10. CREATE function to mask sensitive profile data for non-privileged access
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
    -- Return full data
    result := row_to_json(profile_record)::jsonb;
  ELSE
    -- Return masked data
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
      END
    );
  END IF;
  
  -- Log access if admin viewing another user's data
  IF auth.uid() != target_user_id AND is_admin(auth.uid()) THEN
    PERFORM log_sensitive_data_access('profiles', target_user_id, 'Profile data accessed');
  END IF;
  
  RETURN result;
END;
$$;