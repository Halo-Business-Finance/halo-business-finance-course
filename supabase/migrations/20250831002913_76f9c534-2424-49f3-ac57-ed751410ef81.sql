-- Fix Security Linter Warnings - Function Search Path Mutable

-- Fix detect_rate_limit_bypass function
CREATE OR REPLACE FUNCTION detect_rate_limit_bypass()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bypass_attempts INTEGER;
BEGIN
  -- Check for potential bypass attempts (multiple IPs submitting rapidly)
  SELECT COUNT(DISTINCT ip_address) INTO bypass_attempts
  FROM public.lead_submission_rate_limits
  WHERE created_at > now() - interval '5 minutes'
    AND submission_count >= 3;
  
  -- Alert if suspicious activity detected
  IF bypass_attempts >= 3 THEN
    PERFORM create_security_alert(
      'rate_limit_bypass_attempt',
      'high',
      'Potential Rate Limit Bypass Detected',
      format('Multiple IPs (%s) detected submitting forms rapidly, potential coordinated attack', bypass_attempts),
      jsonb_build_object(
        'bypass_attempts', bypass_attempts,
        'detection_window', '5_minutes',
        'alert_level', 'high',
        'requires_investigation', true
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix log_admin_sensitive_access function
CREATE OR REPLACE FUNCTION log_admin_sensitive_access(
  p_resource_type text,
  p_resource_id text,
  p_access_type text,
  p_data_accessed jsonb DEFAULT '{}'::jsonb
)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Enhanced logging for admin access to sensitive data
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    format('enhanced_%s_access', p_access_type),
    p_resource_type,
    jsonb_build_object(
      'resource_id', p_resource_id,
      'access_type', p_access_type,
      'timestamp', now(),
      'data_accessed', p_data_accessed,
      'security_level', 'enhanced_monitoring',
      'compliance_relevant', true,
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
    ),
    'confidential'
  );
  
  -- Create security event for real-time monitoring
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details,
    logged_via_secure_function
  ) VALUES (
    auth.uid(),
    'admin_enhanced_access',
    'medium',
    jsonb_build_object(
      'resource_type', p_resource_type,
      'resource_id', p_resource_id,
      'access_type', p_access_type,
      'requires_monitoring', true,
      'timestamp', now()
    ),
    true
  );
END;
$$;

-- Fix monitor_security_policy_violations function
CREATE OR REPLACE FUNCTION monitor_security_policy_violations()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  violation_count INTEGER;
BEGIN
  -- Check for users with multiple permission denied events
  SELECT COUNT(*) INTO violation_count
  FROM public.security_events
  WHERE event_type = 'permission_denied_alert'
    AND created_at > now() - interval '1 hour';
  
  -- Create alert if excessive violations detected
  IF violation_count >= 10 THEN
    PERFORM create_security_alert(
      'excessive_permission_violations',
      'high',
      'Excessive Permission Violations Detected',
      format('%s permission denied events in the last hour. Potential attack or misconfiguration.', violation_count),
      jsonb_build_object(
        'violation_count', violation_count,
        'time_window', '1_hour',
        'requires_investigation', true,
        'potential_attack', true
      )
    );
  END IF;
END;
$$;