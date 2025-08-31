-- Clear fake security events (developer tools detection, etc.)
DELETE FROM public.security_events 
WHERE event_type IN (
  'developer_tools_detected',
  'console_access_detected',
  'potential_debugging'
) 
OR (details->>'potential_debugging')::boolean = true
OR event_severity = 'low';

-- Update security event types to focus on real threats
UPDATE public.security_events 
SET event_type = 'authentication_failure'
WHERE event_type = 'failed_login';

-- Remove redundant security logging that creates noise
DELETE FROM public.security_events 
WHERE event_type IN (
  'profile_self_access',
  'session_validation'
) 
AND logged_via_secure_function = true;

-- Keep only critical and high severity events for real monitoring
DELETE FROM public.security_events 
WHERE severity NOT IN ('critical', 'high', 'medium')
AND event_type NOT IN (
  'authentication_failure',
  'unauthorized_access_attempt',
  'suspicious_activity',
  'potential_breach',
  'rate_limit_exceeded',
  'multiple_failed_attempts'
);

-- Add index for faster real-time monitoring queries
CREATE INDEX IF NOT EXISTS idx_security_events_realtime 
ON public.security_events (created_at DESC, severity, event_type)
WHERE severity IN ('critical', 'high');

-- Create function for real security threat detection
CREATE OR REPLACE FUNCTION public.detect_real_security_threats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  recent_failures INTEGER;
  suspicious_ips RECORD;
BEGIN
  -- Only process actual security events, not development noise
  IF NEW.event_type NOT IN ('authentication_failure', 'unauthorized_access_attempt', 'suspicious_activity') THEN
    RETURN NEW;
  END IF;

  -- Detect multiple authentication failures
  IF NEW.event_type = 'authentication_failure' THEN
    SELECT COUNT(*) INTO recent_failures
    FROM public.security_events
    WHERE event_type = 'authentication_failure'
    AND user_id = NEW.user_id
    AND created_at > (now() - INTERVAL '15 minutes');
    
    IF recent_failures >= 3 THEN
      -- Create high-severity alert for repeated failures
      INSERT INTO public.security_events (
        user_id, 
        event_type, 
        severity, 
        details,
        logged_via_secure_function
      ) VALUES (
        NEW.user_id,
        'multiple_authentication_failures',
        'high',
        jsonb_build_object(
          'failure_count', recent_failures + 1,
          'time_window_minutes', 15,
          'potential_brute_force', true,
          'requires_investigation', true,
          'timestamp', now()
        ),
        true
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for real-time threat detection
DROP TRIGGER IF EXISTS real_security_threat_detection ON public.security_events;
CREATE TRIGGER real_security_threat_detection
AFTER INSERT ON public.security_events
FOR EACH ROW
EXECUTE FUNCTION public.detect_real_security_threats();