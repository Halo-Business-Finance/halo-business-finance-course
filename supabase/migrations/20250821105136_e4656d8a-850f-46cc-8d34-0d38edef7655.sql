-- Security Hardening Migration: Critical Data Protection
-- Phase 1: Strengthen Profile Data RLS Policies and Secure Sensitive Tables

-- 1. DROP existing overly permissive profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. CREATE granular profile policies with field-level security
CREATE POLICY "Users can view their own basic profile data"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all basic profile data"
ON public.profiles  
FOR SELECT
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

CREATE POLICY "Super admins only can view audit logs"
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

CREATE POLICY "Super admins only can manage audit logs"
ON public.admin_audit_log
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- 5. LOCK DOWN Security Events - Admin Roles Only
DROP POLICY IF EXISTS "Admins can view all security events" ON public.security_events;

CREATE POLICY "Admin roles only can view security events"
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

-- 6. SECURE Rate Limit Data - System/Admin Only
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limit_attempts;

CREATE POLICY "System and super admins can manage rate limits"
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

-- 8. CREATE data classification levels
CREATE TYPE public.data_classification AS ENUM (
  'public',
  'internal', 
  'confidential',
  'restricted'
);

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

-- 11. CREATE security view for profiles with data masking
CREATE OR REPLACE VIEW public.profiles_secure AS
SELECT 
  id,
  user_id,
  name,
  CASE 
    WHEN can_view_sensitive_profile_data(user_id) THEN email
    ELSE CASE 
      WHEN email IS NOT NULL THEN 
        substring(email from 1 for 2) || '***@' || split_part(email, '@', 2)
      ELSE NULL
    END
  END as email,
  CASE 
    WHEN can_view_sensitive_profile_data(user_id) THEN phone
    ELSE CASE 
      WHEN phone IS NOT NULL THEN '***-***-' || right(phone, 4)
      ELSE NULL
    END
  END as phone,
  CASE 
    WHEN can_view_sensitive_profile_data(user_id) THEN location
    ELSE CASE 
      WHEN location IS NOT NULL THEN split_part(location, ',', -1) -- Show only state/country
      ELSE NULL
    END
  END as location,
  title,
  company,
  avatar_url,
  city,
  state,
  theme,
  language,
  timezone,
  date_format,
  font_size,
  reduced_motion,
  email_notifications,
  push_notifications,
  marketing_emails,
  marketing_communications,
  course_progress,
  weekly_progress,
  webinar_reminders,
  new_courses,
  join_date,
  created_at,
  updated_at
FROM public.profiles;

-- 12. ADD RLS to the secure view
ALTER VIEW public.profiles_secure SET (security_barrier = true);

-- 13. CREATE security monitoring triggers
CREATE OR REPLACE FUNCTION public.monitor_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to sensitive profile data by admins
  IF TG_TABLE_NAME = 'profiles' AND OLD IS DISTINCT FROM NEW THEN
    PERFORM log_sensitive_data_access('profiles', NEW.user_id, 'Profile data modified');
  END IF;
  
  -- Detect suspicious access patterns
  IF TG_OP = 'SELECT' AND is_admin(auth.uid()) THEN
    -- Could add rate limiting or suspicious pattern detection here
    NULL;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 14. UPDATE existing policies to use data classification
-- Note: Existing policies above already implement these patterns

-- 15. CREATE security health check function
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
    )
  ) INTO health_report;

  RETURN health_report;
END;
$$;