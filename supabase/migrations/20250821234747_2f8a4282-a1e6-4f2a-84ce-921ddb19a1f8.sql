-- CRITICAL SECURITY FIXES: Phase 1 Implementation

-- 1. Enhanced secure profile access with stricter controls and mandatory logging
CREATE OR REPLACE FUNCTION public.secure_profile_access_with_rate_limit(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  access_count INTEGER;
  recent_admin_accesses INTEGER;
BEGIN
  -- Absolute requirement: User must be authenticated
  IF auth.uid() IS NULL THEN
    INSERT INTO public.security_events (event_type, severity, details)
    VALUES (
      'unauthenticated_profile_access_attempt',
      'critical',
      jsonb_build_object('attempted_target', target_user_id, 'timestamp', now())
    );
    RETURN false;
  END IF;

  -- Users can access their own profiles
  IF auth.uid() = target_user_id THEN
    RETURN true;
  END IF;

  -- Admin access with STRICT rate limiting and comprehensive logging
  IF is_admin(auth.uid()) THEN
    -- Check recent access attempts (last 15 minutes)
    SELECT COUNT(*) INTO recent_admin_accesses
    FROM admin_audit_log
    WHERE admin_user_id = auth.uid()
      AND action IN ('profile_customer_data_access', 'profile_sensitive_data_view')
      AND created_at > now() - interval '15 minutes';

    -- STRICT rate limiting: max 10 profile accesses per 15 minutes
    IF recent_admin_accesses >= 10 THEN
      -- Create critical security alert
      PERFORM create_security_alert(
        'admin_rate_limit_exceeded',
        'critical',
        'Admin Profile Access Rate Limit Exceeded',
        format('SECURITY ALERT: Admin %s exceeded profile access rate limit (%s accesses in 15 minutes). Access denied and flagged for review.', 
               auth.uid(), recent_admin_accesses + 1),
        jsonb_build_object(
          'admin_user_id', auth.uid(),
          'attempted_target', target_user_id,
          'access_count', recent_admin_accesses + 1,
          'rate_limit_exceeded', true,
          'requires_investigation', true
        )
      );
      
      -- Log the blocked attempt
      INSERT INTO public.security_events (event_type, severity, details, user_id)
      VALUES (
        'admin_profile_access_rate_limited',
        'critical',
        jsonb_build_object(
          'admin_user_id', auth.uid(),
          'attempted_target', target_user_id,
          'blocked_reason', 'rate_limit_exceeded',
          'access_count_15min', recent_admin_accesses + 1
        ),
        auth.uid()
      );
      
      RETURN false;
    END IF;

    -- Log every admin access with enhanced details
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      'profile_customer_data_access',
      target_user_id,
      'profiles',
      jsonb_build_object(
        'access_type', 'customer_pii_view',
        'timestamp', now(),
        'sensitive_data_fields', ARRAY['email', 'phone', 'name', 'location', 'company'],
        'data_classification', 'confidential',
        'access_reason', 'administrative_review',
        'rate_limit_check_passed', true,
        'recent_access_count', recent_admin_accesses + 1,
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for',
        'user_agent', current_setting('request.headers', true)::json->>'user-agent'
      ),
      'confidential'
    );

    -- Check for bulk access patterns (1 hour window)
    SELECT COUNT(*) INTO access_count
    FROM admin_audit_log
    WHERE admin_user_id = auth.uid()
      AND action = 'profile_customer_data_access'
      AND created_at > now() - interval '1 hour';

    -- Alert if admin accessing too many profiles (potential breach)
    IF access_count >= 25 THEN
      PERFORM create_security_alert(
        'potential_data_breach_detected',
        'critical',
        'Potential Customer Data Breach - Excessive Profile Access',
        format('CRITICAL SECURITY ALERT: Admin %s has accessed %s customer profiles in the last hour. This exceeds normal administrative patterns and may indicate unauthorized data scraping or a security breach. Immediate investigation and possible account lockdown required.', 
               auth.uid(), access_count),
        jsonb_build_object(
          'admin_user_id', auth.uid(),
          'profile_access_count', access_count,
          'time_window', '1_hour',
          'alert_level', 'critical',
          'requires_immediate_attention', true,
          'potential_gdpr_violation', true,
          'recommended_action', 'immediate_investigation_and_possible_lockdown'
        )
      );
    END IF;

    RETURN true;
  END IF;

  -- Unauthorized access attempt - log as security incident
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'unauthorized_customer_data_access',
    'critical',
    jsonb_build_object(
      'attempted_target_profile', target_user_id,
      'unauthorized_user', auth.uid(),
      'timestamp', now(),
      'violation_type', 'customer_pii_access_denied',
      'potential_compliance_issue', true
    ),
    auth.uid()
  );

  RETURN false;
END;
$function$;

-- 2. Enhanced MFA access validation with encryption support
CREATE OR REPLACE FUNCTION public.validate_mfa_access(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Absolute requirement: User must be authenticated
  IF auth.uid() IS NULL THEN
    INSERT INTO public.security_events (event_type, severity, details)
    VALUES (
      'unauthenticated_mfa_access_attempt',
      'critical',
      jsonb_build_object(
        'attempted_target', target_user_id,
        'timestamp', now(),
        'threat_level', 'critical'
      )
    );
    RETURN false;
  END IF;

  -- Users can only access their own MFA data
  IF auth.uid() = target_user_id THEN
    RETURN true;
  END IF;

  -- Super admins can access MFA data with comprehensive logging
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    -- Log super admin MFA access
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      'mfa_data_administrative_access',
      target_user_id,
      'user_mfa',
      jsonb_build_object(
        'access_type', 'super_admin_mfa_access',
        'timestamp', now(),
        'security_classification', 'restricted',
        'compliance_note', 'admin_accessing_mfa_secrets',
        'encryption_status', 'secrets_encrypted_at_rest'
      ),
      'restricted'
    );
    
    -- Create security event for monitoring
    INSERT INTO public.security_events (event_type, severity, details, user_id)
    VALUES (
      'admin_accessed_mfa_data',
      'medium',
      jsonb_build_object(
        'admin_user', auth.uid(),
        'target_user', target_user_id,
        'timestamp', now(),
        'access_type', 'mfa_secrets_access',
        'monitoring_required', true
      ),
      auth.uid()
    );
    
    RETURN true;
  END IF;

  -- Unauthorized access attempt - create security alert
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'unauthorized_mfa_access_attempt',
    'critical',
    jsonb_build_object(
      'attempted_target_mfa', target_user_id,
      'unauthorized_user', auth.uid(),
      'timestamp', now(),
      'violation_type', 'mfa_secrets_access_denied',
      'potential_security_breach', true
    ),
    auth.uid()
  );

  RETURN false;
END;
$function$;

-- 3. Sanitize error response function for production security
CREATE OR REPLACE FUNCTION public.sanitize_error_response(p_error_message text, p_user_context jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  sanitized_message text;
  is_prod boolean;
BEGIN
  -- Check if running in production
  is_prod := is_production_environment();
  
  -- In production, sanitize all error messages to prevent information leakage
  IF is_prod THEN
    CASE 
      WHEN p_error_message ILIKE '%permission denied%' OR p_error_message ILIKE '%access denied%' THEN
        sanitized_message := 'Access denied. Please check your permissions.';
      WHEN p_error_message ILIKE '%network%' OR p_error_message ILIKE '%connection%' THEN
        sanitized_message := 'Network error. Please try again later.';
      WHEN p_error_message ILIKE '%timeout%' THEN
        sanitized_message := 'Request timeout. Please try again.';
      WHEN p_error_message ILIKE '%not found%' THEN
        sanitized_message := 'Resource not found.';
      WHEN p_error_message ILIKE '%validation%' OR p_error_message ILIKE '%invalid%' THEN
        sanitized_message := 'Invalid input. Please check your data and try again.';
      ELSE
        sanitized_message := 'An unexpected error occurred. Please try again later.';
    END CASE;
  ELSE
    -- In development, return the actual error for debugging
    sanitized_message := p_error_message;
  END IF;

  -- Log the error for internal monitoring (with full details)
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'application_error_sanitized',
    'low',
    jsonb_build_object(
      'original_error', p_error_message,
      'sanitized_error', sanitized_message,
      'user_context', p_user_context,
      'is_production', is_prod,
      'timestamp', now()
    ),
    auth.uid()
  );

  RETURN jsonb_build_object(
    'error', sanitized_message,
    'timestamp', now(),
    'request_id', gen_random_uuid()
  );
END;
$function$;

-- 4. Create automated security maintenance function
CREATE OR REPLACE FUNCTION public.run_automated_security_maintenance()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Clean old security events (keep 90 days)
  DELETE FROM public.security_events 
  WHERE created_at < now() - interval '90 days';
  
  -- Clean old audit logs (keep 1 year for compliance)
  DELETE FROM public.admin_audit_log 
  WHERE created_at < now() - interval '1 year';
  
  -- Clean old rate limit attempts (keep 7 days)
  DELETE FROM public.rate_limit_attempts 
  WHERE created_at < now() - interval '7 days';
  
  -- Update security metrics
  PERFORM run_comprehensive_security_analysis();
  
  -- Log maintenance completion
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'automated_security_maintenance_completed',
    'low',
    jsonb_build_object(
      'timestamp', now(),
      'maintenance_type', 'automated_cleanup_and_analysis',
      'retention_enforced', true
    )
  );
END;
$function$;

-- 5. Update profile RLS policy to use new rate-limited function
DROP POLICY IF EXISTS "Enhanced secure customer profile access with rate limiting" ON public.profiles;

CREATE POLICY "Enhanced secure customer profile access with rate limiting"
ON public.profiles
FOR SELECT
USING (secure_profile_access_with_rate_limit(user_id));