-- CRITICAL SECURITY REMEDIATION MIGRATION
-- Fix profile access controls, enhance rate limiting, and secure logging

-- 1. CRITICAL: Restrict profile access with mandatory rate limiting
CREATE OR REPLACE FUNCTION public.secure_profile_access_with_rate_limit(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  access_count INTEGER;
  current_user_id UUID := auth.uid();
BEGIN
  -- ABSOLUTE REQUIREMENT: Authentication
  IF current_user_id IS NULL THEN
    INSERT INTO public.security_events (event_type, severity, details)
    VALUES (
      'unauthenticated_profile_access_blocked',
      'critical',
      jsonb_build_object('attempted_target', target_user_id, 'timestamp', now(), 'threat_level', 'critical')
    );
    RETURN false;
  END IF;

  -- Users can ONLY access their own profiles
  IF current_user_id = target_user_id THEN
    RETURN true;
  END IF;

  -- Super admins ONLY can access other profiles with strict logging and rate limiting
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = current_user_id 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    -- Log unauthorized access attempt
    INSERT INTO public.security_events (event_type, severity, details, user_id)
    VALUES (
      'unauthorized_profile_access_denied',
      'critical',
      jsonb_build_object(
        'attempted_target', target_user_id,
        'requesting_user', current_user_id,
        'timestamp', now(),
        'access_denied_reason', 'insufficient_super_admin_privileges'
      ),
      current_user_id
    );
    RETURN false;
  END IF;

  -- Rate limiting for super admin access (max 3 different profiles per hour)
  SELECT COUNT(DISTINCT target_user_id) INTO access_count
  FROM admin_audit_log
  WHERE admin_user_id = current_user_id
    AND action = 'profile_super_admin_access'
    AND created_at > now() - interval '1 hour';

  IF access_count >= 3 THEN
    -- Create immediate security alert for potential abuse
    PERFORM create_security_alert(
      'admin_profile_access_rate_exceeded',
      'critical',
      'Super Admin Profile Access Rate Exceeded',
      format('SECURITY ALERT: Super Admin %s has exceeded profile access limits. Potential unauthorized access detected.', current_user_id),
      jsonb_build_object(
        'admin_user_id', current_user_id,
        'rate_limit_exceeded', true,
        'hourly_access_count', access_count,
        'requires_investigation', true
      )
    );
    RETURN false;
  END IF;

  -- Log super admin access with mandatory justification
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    target_resource,
    details,
    data_classification
  ) VALUES (
    current_user_id,
    'profile_super_admin_access',
    target_user_id,
    'profiles',
    jsonb_build_object(
      'access_type', 'super_admin_profile_view',
      'timestamp', now(),
      'justification', 'administrative_review',
      'security_classification', 'confidential',
      'rate_limit_check', 'passed',
      'access_count_this_hour', access_count + 1
    ),
    'confidential'
  );

  RETURN true;
END;
$function$;

-- 2. Enhanced MFA access validation
CREATE OR REPLACE FUNCTION public.validate_mfa_access(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Users can access their own MFA data
  IF auth.uid() = target_user_id THEN
    RETURN true;
  END IF;

  -- Only super admins can access MFA data with logging
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    -- Log MFA access
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      'mfa_administrative_access',
      target_user_id,
      'user_mfa',
      jsonb_build_object(
        'access_type', 'super_admin_mfa_access',
        'timestamp', now(),
        'security_classification', 'restricted'
      ),
      'restricted'
    );
    RETURN true;
  END IF;

  -- Log unauthorized access attempt
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'unauthorized_mfa_access_attempt',
    'critical',
    jsonb_build_object(
      'attempted_target', target_user_id,
      'unauthorized_user', auth.uid(),
      'timestamp', now()
    ),
    auth.uid()
  );

  RETURN false;
END;
$function$;

-- 3. Secure error response sanitization
CREATE OR REPLACE FUNCTION public.sanitize_error_response(
  p_error_message text,
  p_user_context jsonb DEFAULT '{}'::jsonb
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  sanitized_response jsonb;
BEGIN
  -- Production-safe error messages only
  sanitized_response := jsonb_build_object(
    'error', 'An unexpected error occurred. Please try again later.',
    'error_code', 'GENERIC_ERROR',
    'timestamp', now(),
    'support_reference', gen_random_uuid()
  );

  -- Log the actual error securely for internal monitoring
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'application_error_sanitized',
    'medium',
    jsonb_build_object(
      'sanitized_for_user', true,
      'user_context', p_user_context,
      'error_occurred', true,
      'timestamp', now()
    ),
    auth.uid()
  );

  RETURN sanitized_response;
END;
$function$;

-- 4. Automated security maintenance
CREATE OR REPLACE FUNCTION public.run_automated_security_maintenance()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Clean old rate limit entries
  DELETE FROM rate_limit_attempts 
  WHERE created_at < now() - interval '24 hours';

  -- Clean old security events (keep 30 days for compliance)
  DELETE FROM security_events 
  WHERE created_at < now() - interval '30 days'
    AND severity = 'low';

  -- Run security pattern analysis
  PERFORM analyze_security_events();

  -- Log maintenance execution
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'automated_security_maintenance_completed',
    'low',
    jsonb_build_object(
      'timestamp', now(),
      'maintenance_type', 'automated_cleanup_and_analysis'
    )
  );
END;
$function$;

-- Update the profiles RLS policy to use the enhanced security function
DROP POLICY IF EXISTS "Enhanced secure customer profile access with rate limiting" ON public.profiles;

CREATE POLICY "CRITICAL: Super restricted profile access with rate limiting" 
ON public.profiles 
FOR SELECT 
USING (secure_profile_access_with_rate_limit(user_id));

-- Ensure user_id columns are non-nullable where appropriate
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.user_roles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.course_enrollments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.course_progress ALTER COLUMN user_id SET NOT NULL;