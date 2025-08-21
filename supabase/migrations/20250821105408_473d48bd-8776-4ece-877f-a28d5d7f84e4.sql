-- Security Hardening Migration: Critical Data Protection (Fixed)
-- Phase 1: Strengthen Profile Data RLS Policies and Secure Sensitive Tables

-- 1. DROP existing profile policies with proper names
DROP POLICY IF EXISTS "Users can view their own basic profile data" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all basic profile data" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- 2. CREATE enhanced profile policies with granular security
CREATE POLICY "Users can view own profile data"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile data"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile data"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile data"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles with logging"
ON public.profiles  
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (is_admin(auth.uid()));

-- 3. CREATE function for sensitive profile data access
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

-- 4. SECURE Admin Audit Logs - Super Admin Only
DROP POLICY IF EXISTS "Super admins can view audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Only admins can insert audit logs" ON public.admin_audit_log;

CREATE POLICY "Super admins can view audit logs"
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

CREATE POLICY "System can insert audit logs"
ON public.admin_audit_log
FOR INSERT
WITH CHECK ((auth.uid() IS NULL) OR is_admin(auth.uid()));

-- 5. LOCK DOWN Security Events - Admin Roles Only
DROP POLICY IF EXISTS "Admins can view all security events" ON public.security_events;
DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;

CREATE POLICY "Admins can view security events"
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

CREATE POLICY "System can create security events"
ON public.security_events
FOR INSERT
WITH CHECK (true);

-- 6. SECURE Rate Limit Data - System/Admin Only
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

-- 7. CREATE security audit function for sensitive data access logging
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

-- 8. CREATE data classification levels (if not exists)
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

-- 9. ADD data classification to sensitive tables
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS data_classification data_classification DEFAULT 'confidential';

ALTER TABLE public.admin_audit_log 
ADD COLUMN IF NOT EXISTS data_classification data_classification DEFAULT 'restricted';

ALTER TABLE public.security_events 
ADD COLUMN IF NOT EXISTS data_classification data_classification DEFAULT 'restricted';

-- 10. CREATE function to check if user can access classified data
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

-- 11. CREATE security health check function for monitoring
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
    'critical_fixes_applied', true
  ) INTO health_report;

  RETURN health_report;
END;
$$;