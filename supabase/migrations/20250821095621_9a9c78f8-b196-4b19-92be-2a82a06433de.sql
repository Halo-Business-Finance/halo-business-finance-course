-- Fix security warning: Set search_path for all functions
-- Update check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip_address INET,
  p_endpoint TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_attempts INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
  is_blocked BOOLEAN;
  time_remaining INTEGER;
BEGIN
  -- Calculate window start
  window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Clean old entries
  DELETE FROM rate_limit_attempts 
  WHERE window_start < (NOW() - (p_window_minutes || ' minutes')::INTERVAL);
  
  -- Get current attempts for this IP and endpoint
  SELECT 
    COALESCE(SUM(attempt_count), 0),
    bool_or(is_blocked)
  INTO current_attempts, is_blocked
  FROM rate_limit_attempts 
  WHERE ip_address = p_ip_address 
    AND endpoint = p_endpoint 
    AND window_start > (NOW() - (p_window_minutes || ' minutes')::INTERVAL);
  
  -- Check if blocked
  IF is_blocked OR current_attempts >= p_max_attempts THEN
    -- Update block status
    UPDATE rate_limit_attempts 
    SET is_blocked = TRUE, updated_at = NOW()
    WHERE ip_address = p_ip_address AND endpoint = p_endpoint;
    
    -- Calculate time remaining
    SELECT EXTRACT(EPOCH FROM (
      MAX(window_start) + (p_window_minutes || ' minutes')::INTERVAL - NOW()
    ))::INTEGER
    INTO time_remaining
    FROM rate_limit_attempts
    WHERE ip_address = p_ip_address AND endpoint = p_endpoint;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'current_attempts', current_attempts,
      'max_attempts', p_max_attempts,
      'time_remaining_seconds', COALESCE(time_remaining, 0),
      'blocked_until', NOW() + (COALESCE(time_remaining, 0) || ' seconds')::INTERVAL
    );
  END IF;
  
  -- Record this attempt
  INSERT INTO rate_limit_attempts (ip_address, endpoint, attempt_count, window_start)
  VALUES (p_ip_address, p_endpoint, 1, NOW())
  ON CONFLICT (ip_address, endpoint) 
  DO UPDATE SET 
    attempt_count = rate_limit_attempts.attempt_count + 1,
    updated_at = NOW();
  
  RETURN jsonb_build_object(
    'allowed', true,
    'current_attempts', current_attempts + 1,
    'max_attempts', p_max_attempts,
    'remaining_attempts', p_max_attempts - current_attempts - 1
  );
END;
$$;

-- Update create_security_alert function
CREATE OR REPLACE FUNCTION public.create_security_alert(
  p_alert_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO security_alerts (alert_type, severity, title, description, metadata)
  VALUES (p_alert_type, p_severity, p_title, p_description, p_metadata)
  RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

-- Update analyze_security_events function
CREATE OR REPLACE FUNCTION public.analyze_security_events()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  suspicious_ips RECORD;
  failed_admin_attempts RECORD;
BEGIN
  -- Check for suspicious IP activity (multiple failed logins from same IP)
  FOR suspicious_ips IN
    SELECT 
      (details->>'ip_address') as ip,
      COUNT(*) as attempt_count,
      MAX(created_at) as last_attempt
    FROM security_events 
    WHERE event_type = 'failed_login' 
      AND created_at > NOW() - INTERVAL '1 hour'
      AND (details->>'ip_address') IS NOT NULL
    GROUP BY (details->>'ip_address')
    HAVING COUNT(*) >= 10
  LOOP
    -- Create alert for suspicious IP
    PERFORM create_security_alert(
      'suspicious_ip_activity',
      'high',
      'Suspicious IP Activity Detected',
      format('IP %s has %s failed login attempts in the last hour', 
             suspicious_ips.ip, suspicious_ips.attempt_count),
      jsonb_build_object(
        'ip_address', suspicious_ips.ip,
        'attempt_count', suspicious_ips.attempt_count,
        'last_attempt', suspicious_ips.last_attempt
      )
    );
  END LOOP;

  -- Check for admin account targeting
  FOR failed_admin_attempts IN
    SELECT 
      (details->>'user_email') as email,
      COUNT(*) as attempt_count
    FROM security_events 
    WHERE event_type = 'failed_login' 
      AND created_at > NOW() - INTERVAL '24 hours'
      AND (details->>'user_email') LIKE '%admin%'
    GROUP BY (details->>'user_email')
    HAVING COUNT(*) >= 5
  LOOP
    -- Create alert for admin targeting
    PERFORM create_security_alert(
      'admin_account_targeting',
      'critical',
      'Admin Account Under Attack',
      format('Admin email %s has %s failed login attempts in the last 24 hours', 
             failed_admin_attempts.email, failed_admin_attempts.attempt_count),
      jsonb_build_object(
        'target_email', failed_admin_attempts.email,
        'attempt_count', failed_admin_attempts.attempt_count
      )
    );
  END LOOP;
END;
$$;

-- Update trigger_security_analysis function
CREATE OR REPLACE FUNCTION public.trigger_security_analysis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only analyze on failed login events
  IF NEW.event_type = 'failed_login' THEN
    -- Use pg_notify to trigger background analysis
    PERFORM pg_notify('security_analysis', NEW.id::text);
  END IF;
  
  RETURN NEW;
END;
$$;