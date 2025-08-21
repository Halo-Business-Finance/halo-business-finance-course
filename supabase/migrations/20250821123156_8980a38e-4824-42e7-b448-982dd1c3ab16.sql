-- Security hardening: Add search_path to remaining functions without it
-- This prevents potential search path manipulation attacks

-- Update functions that are missing SET search_path TO 'public'
CREATE OR REPLACE FUNCTION public.assign_default_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Assign default "trainee" role to new users (unless they already have a role)
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id 
    AND is_active = true
  ) THEN
    INSERT INTO user_roles (user_id, role, is_active)
    VALUES (NEW.user_id, 'trainee', true);
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Enhanced audit logging with compliance flags
CREATE OR REPLACE FUNCTION public.enhanced_audit_log(
  p_action text,
  p_target_user_id uuid DEFAULT NULL,
  p_target_resource text DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_compliance_type text DEFAULT 'general'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    p_action,
    p_target_user_id,
    p_target_resource,
    COALESCE(p_details, '{}'::jsonb) || jsonb_build_object(
      'compliance_type', p_compliance_type,
      'gdpr_relevant', CASE WHEN p_compliance_type IN ('customer_data_access', 'pii_access') THEN true ELSE false END,
      'ccpa_relevant', CASE WHEN p_compliance_type IN ('customer_data_access', 'pii_access') THEN true ELSE false END,
      'timestamp_iso', now(),
      'session_context', current_setting('request.headers', true)
    ),
    'confidential'
  );
END;
$function$;

-- Data retention policy enforcement
CREATE OR REPLACE FUNCTION public.cleanup_old_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Remove security events older than 2 years (compliance requirement)
  DELETE FROM public.security_events 
  WHERE created_at < now() - interval '2 years';

  -- Remove old audit logs older than 7 years (legal requirement)
  DELETE FROM public.admin_audit_log 
  WHERE created_at < now() - interval '7 years';

  -- Log cleanup activity
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'security_data_retention_cleanup',
    'low',
    jsonb_build_object(
      'cleanup_timestamp', now(),
      'retention_policy', 'automated_compliance_cleanup'
    )
  );
END;
$function$;

-- Real-time security metrics function
CREATE OR REPLACE FUNCTION public.get_security_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  metrics jsonb;
  active_alerts integer;
  failed_logins_24h integer;
  admin_actions_24h integer;
  blocked_ips integer;
BEGIN
  -- Only admins can access security metrics
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Count active security alerts
  SELECT COUNT(*) INTO active_alerts
  FROM security_alerts 
  WHERE is_resolved = false;

  -- Count failed logins in last 24 hours
  SELECT COUNT(*) INTO failed_logins_24h
  FROM security_events 
  WHERE event_type = 'failed_login' 
    AND created_at > now() - interval '24 hours';

  -- Count admin actions in last 24 hours
  SELECT COUNT(*) INTO admin_actions_24h
  FROM admin_audit_log 
  WHERE created_at > now() - interval '24 hours';

  -- Count blocked IPs
  SELECT COUNT(DISTINCT ip_address) INTO blocked_ips
  FROM rate_limit_attempts 
  WHERE is_blocked = true;

  metrics := jsonb_build_object(
    'active_alerts', active_alerts,
    'failed_logins_24h', failed_logins_24h,
    'admin_actions_24h', admin_actions_24h,
    'blocked_ips', blocked_ips,
    'security_score', CASE 
      WHEN active_alerts = 0 AND failed_logins_24h < 10 THEN 'excellent'
      WHEN active_alerts < 3 AND failed_logins_24h < 50 THEN 'good'
      WHEN active_alerts < 10 AND failed_logins_24h < 100 THEN 'moderate'
      ELSE 'attention_required'
    END,
    'last_updated', now()
  );

  RETURN metrics;
END;
$function$;

-- Create alert for multiple failed authentication attempts
CREATE OR REPLACE FUNCTION public.check_failed_auth_threshold()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  recent_failures integer;
  user_email text;
BEGIN
  IF NEW.event_type = 'failed_login' THEN
    -- Count recent failures for this user/email
    SELECT COUNT(*) INTO recent_failures
    FROM security_events
    WHERE event_type = 'failed_login'
      AND user_id = NEW.user_id
      AND created_at > now() - interval '1 hour';

    -- Extract email from details
    user_email := NEW.details->>'user_email';

    -- Create alert if threshold exceeded
    IF recent_failures >= 5 THEN
      PERFORM create_security_alert(
        'multiple_failed_auth_attempts',
        'high',
        'Multiple Failed Authentication Attempts',
        format('User %s has %s failed login attempts in the last hour', 
               COALESCE(user_email, 'unknown'), recent_failures),
        jsonb_build_object(
          'user_id', NEW.user_id,
          'user_email', user_email,
          'failure_count', recent_failures,
          'time_window', '1_hour',
          'requires_investigation', true
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for failed auth monitoring
DROP TRIGGER IF EXISTS trigger_check_failed_auth ON security_events;
CREATE TRIGGER trigger_check_failed_auth
  AFTER INSERT ON security_events
  FOR EACH ROW
  EXECUTE FUNCTION check_failed_auth_threshold();