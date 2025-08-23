-- Phase 2: Enhanced Security Headers and Content Security Policy
-- Add security headers configuration function
CREATE OR REPLACE FUNCTION public.get_security_headers()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN jsonb_build_object(
    'Content-Security-Policy', 'default-src ''self''; script-src ''self'' ''unsafe-inline'' https://cdn.jsdelivr.net; style-src ''self'' ''unsafe-inline''; img-src ''self'' data: https:; font-src ''self'' https://fonts.gstatic.com; connect-src ''self'' wss: https:',
    'X-Frame-Options', 'DENY',
    'X-Content-Type-Options', 'nosniff',
    'Referrer-Policy', 'strict-origin-when-cross-origin',
    'Permissions-Policy', 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security', 'max-age=31536000; includeSubDomains'
  );
END;
$$;

-- Enhanced monitoring for suspicious patterns
CREATE OR REPLACE FUNCTION public.monitor_suspicious_user_behavior()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  suspicious_user RECORD;
BEGIN
  -- Check for users with rapid role changes
  FOR suspicious_user IN
    SELECT 
      user_id,
      COUNT(*) as role_changes,
      MAX(created_at) as last_change
    FROM user_roles 
    WHERE created_at > now() - interval '24 hours'
    GROUP BY user_id
    HAVING COUNT(*) >= 3
  LOOP
    -- Create alert for suspicious role activity
    PERFORM create_security_alert(
      'suspicious_role_activity',
      'high',
      'Suspicious Role Activity Detected',
      format('User %s has had %s role changes in 24 hours. Investigate for account compromise.',
             suspicious_user.user_id, 
             suspicious_user.role_changes),
      jsonb_build_object(
        'user_id', suspicious_user.user_id,
        'role_changes', suspicious_user.role_changes,
        'last_change', suspicious_user.last_change,
        'requires_investigation', true
      )
    );
  END LOOP;

  -- Check for rapid enrollment patterns (potential abuse)
  FOR suspicious_user IN
    SELECT 
      user_id,
      COUNT(*) as enrollment_count,
      MAX(created_at) as last_enrollment
    FROM course_enrollments 
    WHERE created_at > now() - interval '1 hour'
    GROUP BY user_id
    HAVING COUNT(*) >= 5
  LOOP
    -- Create alert for enrollment abuse
    PERFORM create_security_alert(
      'enrollment_abuse_pattern',
      'medium',
      'Rapid Enrollment Pattern Detected',
      format('User %s enrolled in %s courses within 1 hour. Check for automation or abuse.',
             suspicious_user.user_id, 
             suspicious_user.enrollment_count),
      jsonb_build_object(
        'user_id', suspicious_user.user_id,
        'enrollment_count', suspicious_user.enrollment_count,
        'time_window', '1_hour'
      )
    );
  END LOOP;
END;
$$;

-- Function to validate system processes for enhanced security
CREATE OR REPLACE FUNCTION public.validate_system_process(process_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow specific system processes
  RETURN process_type IN ('security_monitoring', 'network_security', 'audit_logging');
END;
$$;

-- Add trigger for automatic suspicious behavior monitoring
CREATE OR REPLACE FUNCTION public.trigger_behavior_monitoring()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Schedule background monitoring
  PERFORM pg_notify('behavior_monitoring', 'check_patterns');
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply monitoring trigger to key tables
DROP TRIGGER IF EXISTS monitor_user_roles_trigger ON public.user_roles;
CREATE TRIGGER monitor_user_roles_trigger
  AFTER INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_behavior_monitoring();

DROP TRIGGER IF EXISTS monitor_enrollments_trigger ON public.course_enrollments;  
CREATE TRIGGER monitor_enrollments_trigger
  AFTER INSERT ON public.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_behavior_monitoring();