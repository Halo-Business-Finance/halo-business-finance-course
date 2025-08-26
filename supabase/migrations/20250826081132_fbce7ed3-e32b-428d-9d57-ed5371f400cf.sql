-- Add rate limiting table for lead submissions
CREATE TABLE IF NOT EXISTS lead_submission_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  submission_count INTEGER DEFAULT 1,
  first_submission_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_submission_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_lead_rate_limits_ip_time 
ON lead_submission_rate_limits(ip_address, last_submission_at);

-- Add honeypot and timing fields to leads table for spam detection
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS honeypot_field TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS form_load_time INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS submission_ip INET DEFAULT NULL;

-- Function to check and enforce lead submission rate limits
CREATE OR REPLACE FUNCTION check_lead_submission_rate_limit(p_ip_address INET)
RETURNS JSONB
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rate_limit_window INTERVAL := '1 hour';
  max_submissions_per_hour INTEGER := 5; -- Max 5 submissions per IP per hour
  current_count INTEGER;
  is_currently_blocked BOOLEAN;
BEGIN
  -- Clean up old rate limit entries (older than 24 hours)
  DELETE FROM lead_submission_rate_limits 
  WHERE last_submission_at < (NOW() - INTERVAL '24 hours');
  
  -- Check current submission count and block status
  SELECT submission_count, is_blocked
  INTO current_count, is_currently_blocked
  FROM lead_submission_rate_limits
  WHERE ip_address = p_ip_address 
  AND last_submission_at > (NOW() - rate_limit_window);
  
  -- If already blocked, deny submission
  IF is_currently_blocked THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'IP temporarily blocked due to excessive submissions',
      'retry_after_minutes', 60
    );
  END IF;
  
  -- If exceeding rate limit, block and deny
  IF current_count >= max_submissions_per_hour THEN
    UPDATE lead_submission_rate_limits 
    SET is_blocked = true, updated_at = now()
    WHERE ip_address = p_ip_address;
    
    -- Log security event
    INSERT INTO security_events (event_type, severity, details)
    VALUES (
      'lead_spam_attempt_blocked',
      'medium',
      jsonb_build_object(
        'ip_address', p_ip_address,
        'submission_count', current_count,
        'blocked_at', now()
      )
    );
    
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Rate limit exceeded. Please try again later.',
      'retry_after_minutes', 60
    );
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO lead_submission_rate_limits (ip_address, submission_count, first_submission_at, last_submission_at)
  VALUES (p_ip_address, 1, now(), now())
  ON CONFLICT (ip_address) DO UPDATE SET
    submission_count = lead_submission_rate_limits.submission_count + 1,
    last_submission_at = now(),
    updated_at = now();
  
  RETURN jsonb_build_object('allowed', true);
END;
$$;

-- Function to validate lead submission for spam indicators
CREATE OR REPLACE FUNCTION validate_lead_submission(
  p_honeypot TEXT,
  p_form_load_time INTEGER,
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_company TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check honeypot field (should be empty for human submissions)
  IF p_honeypot IS NOT NULL AND p_honeypot != '' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'Spam detected: honeypot field filled'
    );
  END IF;
  
  -- Check if form was submitted too quickly (likely bot)
  IF p_form_load_time IS NOT NULL AND p_form_load_time < 3 THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'Submission too fast, please try again'
    );
  END IF;
  
  -- Basic email validation
  IF p_email IS NULL OR p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'Invalid email address format'
    );
  END IF;
  
  -- Check for obviously fake/spam content
  IF (p_first_name ~ '^(test|spam|fake|admin|root)$' OR
      p_last_name ~ '^(test|spam|fake|admin|root)$' OR
      p_company ~ '^(test|spam|fake|admin)$' OR
      p_email ~ '^(test|spam|fake|admin)') THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'Invalid submission detected'
    );
  END IF;
  
  -- Check for minimum field lengths
  IF (LENGTH(p_first_name) < 2 OR LENGTH(p_last_name) < 2 OR LENGTH(p_company) < 2) THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'Please provide complete information'
    );
  END IF;
  
  RETURN jsonb_build_object('valid', true);
END;
$$;

-- Update the leads RLS policy to include spam protection
DROP POLICY IF EXISTS "Public can create leads only" ON leads;

CREATE POLICY "Protected public lead creation" 
ON leads 
FOR INSERT 
WITH CHECK (
  -- Extract IP from request headers (if available)
  CASE 
    WHEN current_setting('request.headers', true)::json->>'x-forwarded-for' IS NOT NULL THEN
      (check_lead_submission_rate_limit(
        (current_setting('request.headers', true)::json->>'x-forwarded-for')::inet
      )->>'allowed')::boolean = true
    ELSE true -- Allow if no IP header (for testing)
  END
  AND
  -- Validate submission for spam indicators
  (validate_lead_submission(
    honeypot_field,
    form_load_time,
    email,
    first_name,
    last_name,
    company
  )->>'valid')::boolean = true
);

-- Create trigger to automatically set submission IP
CREATE OR REPLACE FUNCTION set_lead_submission_ip()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Set IP address from request headers if available
  IF current_setting('request.headers', true)::json->>'x-forwarded-for' IS NOT NULL THEN
    NEW.submission_ip := (current_setting('request.headers', true)::json->>'x-forwarded-for')::inet;
  END IF;
  
  -- Log the lead submission for monitoring
  INSERT INTO security_events (event_type, severity, details)
  VALUES (
    'lead_submission_created',
    'low',
    jsonb_build_object(
      'lead_id', NEW.id,
      'email', NEW.email,
      'company', NEW.company,
      'ip_address', NEW.submission_ip,
      'timestamp', now()
    )
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_lead_submission_ip
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION set_lead_submission_ip();

-- Add unique constraint to prevent exact duplicate submissions
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_duplicate_prevention
ON leads(email, company, COALESCE(phone, ''), created_at::date)
WHERE created_at > now() - INTERVAL '24 hours';

-- Grant necessary permissions
GRANT SELECT ON lead_submission_rate_limits TO authenticated, anon;
GRANT INSERT, UPDATE ON lead_submission_rate_limits TO authenticated, anon;