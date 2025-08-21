-- Enhanced rate limiting table for IP-based tracking
CREATE TABLE IF NOT EXISTS public.rate_limit_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_endpoint ON rate_limit_attempts(ip_address, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON rate_limit_attempts(window_start);

-- Enhanced security monitoring table
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enhanced admin audit log with more fields
ALTER TABLE public.admin_audit_log 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS user_agent_parsed JSONB,
ADD COLUMN IF NOT EXISTS geolocation JSONB,
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata_enhanced JSONB DEFAULT '{}';

-- RLS policies
ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Rate limiting policies (only system and admins can access)
CREATE POLICY "System can manage rate limits"
ON rate_limit_attempts
FOR ALL
USING (auth.uid() IS NULL OR is_admin(auth.uid()));

-- Security alerts policies
CREATE POLICY "Admins can view security alerts"
ON security_alerts
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert security alerts"
ON security_alerts
FOR INSERT
WITH CHECK (auth.uid() IS NULL OR is_admin(auth.uid()));

CREATE POLICY "Admins can update security alerts"
ON security_alerts
FOR UPDATE
USING (is_admin(auth.uid()));

-- Function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip_address INET,
  p_endpoint TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to create security alerts
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

-- Function to analyze security events and create alerts
CREATE OR REPLACE FUNCTION public.analyze_security_events()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Trigger to automatically analyze security events
CREATE OR REPLACE FUNCTION public.trigger_security_analysis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

CREATE TRIGGER security_event_analysis
  AFTER INSERT ON security_events
  FOR EACH ROW
  EXECUTE FUNCTION trigger_security_analysis();

-- Update timestamps trigger for new tables
CREATE TRIGGER update_rate_limit_attempts_updated_at
  BEFORE UPDATE ON rate_limit_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_alerts_updated_at
  BEFORE UPDATE ON security_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();