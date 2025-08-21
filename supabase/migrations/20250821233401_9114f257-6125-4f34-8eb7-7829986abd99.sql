-- CRITICAL SECURITY FIXES - Phase 1: Immediate Critical Fixes

-- 1. Enhanced MFA Security Functions
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
        'compliance_note', 'admin_accessing_mfa_secrets'
      ),
      'restricted'
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

-- 2. Enhanced Biometric Validation Function (already exists, updating)
CREATE OR REPLACE FUNCTION public.validate_biometric_enrollment(p_user_id uuid, p_biometric_type text, p_quality_score integer, p_device_fingerprint text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  existing_count INTEGER;
  device_trusted BOOLEAN := false;
  validation_result JSONB;
BEGIN
  -- Verify user can enroll biometrics
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Users can only enroll their own biometrics';
  END IF;

  -- Check existing biometric count for this type
  SELECT COUNT(*) INTO existing_count
  FROM public.user_biometrics 
  WHERE user_id = p_user_id 
    AND biometric_type = p_biometric_type 
    AND is_active = true;

  -- Check device trust level
  SELECT is_trusted INTO device_trusted
  FROM public.user_devices
  WHERE user_id = p_user_id 
    AND device_fingerprint = p_device_fingerprint
    AND is_active = true;

  -- Quality score validation
  IF p_quality_score < 70 THEN
    validation_result := jsonb_build_object(
      'allowed', false,
      'reason', 'quality_score_too_low',
      'minimum_required', 70,
      'provided_score', p_quality_score
    );
  ELSIF existing_count >= 3 THEN
    validation_result := jsonb_build_object(
      'allowed', false,
      'reason', 'maximum_biometrics_reached',
      'current_count', existing_count,
      'maximum_allowed', 3
    );
  ELSIF NOT device_trusted THEN
    validation_result := jsonb_build_object(
      'allowed', false,
      'reason', 'untrusted_device',
      'device_fingerprint', p_device_fingerprint
    );
  ELSE
    validation_result := jsonb_build_object(
      'allowed', true,
      'quality_score', p_quality_score,
      'device_trusted', device_trusted
    );
  END IF;

  -- Log biometric enrollment attempt
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'biometric_enrollment_validation',
    CASE 
      WHEN (validation_result->>'allowed')::boolean THEN 'low'
      ELSE 'medium'
    END,
    jsonb_build_object(
      'biometric_type', p_biometric_type,
      'quality_score', p_quality_score,
      'device_fingerprint', p_device_fingerprint,
      'validation_result', validation_result,
      'existing_count', existing_count
    ),
    p_user_id
  );

  RETURN validation_result;
END;
$function$;

-- 3. Enhanced Rate Limiting for Profile Access
CREATE OR REPLACE FUNCTION public.check_profile_access_rate_limit(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  admin_access_count INTEGER := 0;
  time_window INTERVAL := '1 hour';
  max_allowed INTEGER := 20;
  is_rate_limited BOOLEAN := false;
BEGIN
  -- Only check rate limit for admin users accessing other profiles
  IF NOT is_admin(auth.uid()) OR auth.uid() = p_user_id THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'self_access_or_not_admin');
  END IF;

  -- Count recent profile access by this admin
  SELECT COUNT(*) INTO admin_access_count
  FROM public.admin_audit_log
  WHERE admin_user_id = auth.uid()
    AND action IN ('profile_sensitive_data_view', 'profile_customer_data_access')
    AND created_at > (now() - time_window);

  -- Check if rate limit exceeded
  IF admin_access_count >= max_allowed THEN
    is_rate_limited := true;
    
    -- Create critical security alert for potential data breach
    PERFORM create_security_alert(
      'admin_profile_access_rate_limit_exceeded',
      'critical',
      'Admin Profile Access Rate Limit Exceeded',
      format('Admin %s has accessed %s profiles in %s. Rate limit exceeded - potential data breach investigation required.',
             auth.uid(), admin_access_count, time_window),
      jsonb_build_object(
        'admin_user_id', auth.uid(),
        'access_count', admin_access_count,
        'time_window', extract(epoch from time_window),
        'max_allowed', max_allowed,
        'requires_investigation', true
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', NOT is_rate_limited,
    'current_count', admin_access_count,
    'max_allowed', max_allowed,
    'time_remaining_seconds', CASE 
      WHEN is_rate_limited THEN extract(epoch from time_window)
      ELSE 0
    END
  );
END;
$function$;

-- 4. Production Security Function - Remove Debug Data
CREATE OR REPLACE FUNCTION public.sanitize_error_response(p_error_message text, p_user_context jsonb DEFAULT '{}')
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  sanitized_message TEXT;
  is_production BOOLEAN;
  final_response JSONB;
BEGIN
  -- Determine if in production (simplified check)
  is_production := current_setting('app.environment', true) = 'production';

  -- Sanitize error message for production
  IF is_production THEN
    -- Generic error messages for production
    CASE 
      WHEN p_error_message ILIKE '%permission%' OR p_error_message ILIKE '%access%' THEN
        sanitized_message := 'Access denied. Please contact support if this persists.';
      WHEN p_error_message ILIKE '%not found%' THEN
        sanitized_message := 'Resource not found.';
      WHEN p_error_message ILIKE '%connection%' OR p_error_message ILIKE '%timeout%' THEN
        sanitized_message := 'Service temporarily unavailable. Please try again later.';
      ELSE
        sanitized_message := 'An error occurred. Please contact support with error ID: ' || 
                            substring(md5(random()::text) from 1 for 8);
    END CASE;
    
    final_response := jsonb_build_object(
      'error', sanitized_message,
      'error_id', substring(md5(random()::text) from 1 for 8),
      'support_contact', 'support@example.com'
    );
  ELSE
    -- Development - show full error but log security concern
    final_response := jsonb_build_object(
      'error', p_error_message,
      'debug_mode', true,
      'user_context', p_user_context
    );
  END IF;

  -- Log all errors for monitoring
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'error_response_sanitized',
    'low',
    jsonb_build_object(
      'original_error', CASE WHEN is_production THEN '[REDACTED]' ELSE p_error_message END,
      'sanitized_response', final_response,
      'is_production', is_production,
      'user_context', p_user_context
    ),
    auth.uid()
  );

  RETURN final_response;
END;
$function$;

-- 5. Enhanced Security Monitoring Trigger
CREATE OR REPLACE FUNCTION public.monitor_admin_bulk_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  recent_access_count INTEGER;
  critical_threshold INTEGER := 10;
  warning_threshold INTEGER := 5;
BEGIN
  -- Only monitor admin actions on sensitive resources
  IF NEW.action IN ('profile_sensitive_data_view', 'profile_customer_data_access', 'biometric_data_administrative_access', 'mfa_data_administrative_access') THEN
    
    -- Count recent accesses by this admin in the last hour
    SELECT COUNT(DISTINCT target_user_id) INTO recent_access_count
    FROM public.admin_audit_log
    WHERE admin_user_id = NEW.admin_user_id
      AND action = NEW.action
      AND created_at > (now() - interval '1 hour');

    -- Create alerts based on thresholds
    IF recent_access_count >= critical_threshold THEN
      -- Critical alert - potential data breach
      PERFORM create_security_alert(
        'critical_bulk_admin_access_detected',
        'critical',
        'CRITICAL: Potential Data Breach - Bulk Admin Access',
        format('URGENT: Admin %s has accessed %s different user records in 1 hour. Immediate investigation required for potential data breach.',
               NEW.admin_user_id, recent_access_count),
        jsonb_build_object(
          'admin_user_id', NEW.admin_user_id,
          'action_type', NEW.action,
          'unique_users_accessed', recent_access_count,
          'time_window', '1_hour',
          'alert_level', 'critical',
          'requires_immediate_lockdown', true,
          'potential_gdpr_violation', true,
          'contact_security_team', true
        )
      );
    ELSIF recent_access_count >= warning_threshold THEN
      -- Warning alert - monitor closely
      PERFORM create_security_alert(
        'elevated_admin_access_pattern',
        'high',
        'Elevated Admin Access Pattern Detected',
        format('Admin %s has accessed %s different user records in 1 hour. Monitor for potential data scraping.',
               NEW.admin_user_id, recent_access_count),
        jsonb_build_object(
          'admin_user_id', NEW.admin_user_id,
          'action_type', NEW.action,
          'unique_users_accessed', recent_access_count,
          'time_window', '1_hour',
          'alert_level', 'high',
          'monitor_closely', true
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for admin audit monitoring
DROP TRIGGER IF EXISTS monitor_admin_bulk_access_trigger ON public.admin_audit_log;
CREATE TRIGGER monitor_admin_bulk_access_trigger
  AFTER INSERT ON public.admin_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.monitor_admin_bulk_access();

-- 6. Update RLS Policies for Enhanced Security
DROP POLICY IF EXISTS "Enhanced secure MFA access" ON public.user_mfa;
CREATE POLICY "Enhanced secure MFA access" 
ON public.user_mfa 
FOR ALL
USING (validate_mfa_access(user_id))
WITH CHECK (validate_mfa_access(user_id));

-- 7. Create Emergency Security Function
CREATE OR REPLACE FUNCTION public.trigger_emergency_security_lockdown(p_reason text, p_target_user_id uuid DEFAULT NULL)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  lockdown_id UUID;
  affected_sessions INTEGER := 0;
BEGIN
  -- Only super admins can trigger emergency lockdown
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Only super admins can trigger emergency lockdown';
  END IF;

  -- Generate lockdown ID
  lockdown_id := gen_random_uuid();

  -- If specific user targeted, terminate their sessions
  IF p_target_user_id IS NOT NULL THEN
    UPDATE public.user_sessions 
    SET is_active = false, 
        terminated_at = now(),
        termination_reason = 'emergency_security_lockdown'
    WHERE user_id = p_target_user_id 
      AND is_active = true;
    
    GET DIAGNOSTICS affected_sessions = ROW_COUNT;
  END IF;

  -- Log emergency lockdown
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'emergency_security_lockdown_triggered',
    'critical',
    jsonb_build_object(
      'lockdown_id', lockdown_id,
      'triggered_by', auth.uid(),
      'reason', p_reason,
      'target_user_id', p_target_user_id,
      'affected_sessions', affected_sessions,
      'timestamp', now(),
      'requires_investigation', true
    ),
    auth.uid()
  );

  -- Create critical security alert
  PERFORM create_security_alert(
    'emergency_security_lockdown',
    'critical',
    'Emergency Security Lockdown Activated',
    format('Emergency lockdown triggered by admin %s. Reason: %s. Target user: %s. Sessions terminated: %s',
           auth.uid(), p_reason, COALESCE(p_target_user_id::text, 'ALL'), affected_sessions),
    jsonb_build_object(
      'lockdown_id', lockdown_id,
      'triggered_by', auth.uid(),
      'reason', p_reason,
      'target_user_id', p_target_user_id,
      'affected_sessions', affected_sessions,
      'requires_immediate_attention', true
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'lockdown_id', lockdown_id,
    'affected_sessions', affected_sessions,
    'message', 'Emergency lockdown activated successfully'
  );
END;
$function$;