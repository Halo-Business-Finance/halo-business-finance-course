-- Add rate limiting table for lead submissions
CREATE TABLE IF NOT EXISTS lead_submission_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL UNIQUE,
  submission_count INTEGER DEFAULT 1,
  first_submission_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_submission_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add honeypot and timing fields to leads table for spam detection
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS honeypot_field TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS form_load_time INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS submission_ip INET DEFAULT NULL;

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
    RETURN jsonb_build_object('valid', false, 'reason', 'Spam detected');
  END IF;
  
  -- Check if form was submitted too quickly (likely bot)
  IF p_form_load_time IS NOT NULL AND p_form_load_time < 3 THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Submission too fast');
  END IF;
  
  -- Basic email validation
  IF p_email IS NULL OR p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Invalid email format');
  END IF;
  
  -- Check for minimum field lengths and required fields
  IF (LENGTH(TRIM(COALESCE(p_first_name, ''))) < 2 OR 
      LENGTH(TRIM(COALESCE(p_last_name, ''))) < 2 OR 
      LENGTH(TRIM(COALESCE(p_company, ''))) < 2) THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Please provide complete information');
  END IF;
  
  RETURN jsonb_build_object('valid', true);
END;
$$;

-- Function to check rate limiting
CREATE OR REPLACE FUNCTION check_lead_rate_limit()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ip_address_text TEXT;
  submission_count INTEGER;
BEGIN
  -- Try to get IP address from headers
  BEGIN
    ip_address_text := current_setting('request.headers', true)::json->>'x-forwarded-for';
  EXCEPTION WHEN OTHERS THEN
    -- If we can't get IP, allow submission (for testing)
    RETURN true;
  END;
  
  -- If no IP address, allow
  IF ip_address_text IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check submission count from this IP in last hour
  SELECT COUNT(*) INTO submission_count
  FROM leads 
  WHERE submission_ip = ip_address_text::inet 
  AND created_at > (now() - INTERVAL '1 hour');
  
  -- Allow up to 5 submissions per hour per IP
  RETURN submission_count < 5;
END;
$$;

-- Update the RLS policy with spam protection
DROP POLICY IF EXISTS "Protected public lead creation" ON leads;
DROP POLICY IF EXISTS "Public can create leads only" ON leads;

CREATE POLICY "Spam protected lead creation" 
ON leads 
FOR INSERT 
WITH CHECK (
  -- Basic validation check
  (validate_lead_submission(
    honeypot_field,
    form_load_time,
    email,
    first_name,
    last_name,
    company
  )->>'valid')::boolean = true
  AND
  -- Rate limit check
  check_lead_rate_limit() = true
);

-- Trigger to set IP address and log submissions
CREATE OR REPLACE FUNCTION set_lead_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ip_address_text TEXT;
BEGIN
  -- Set IP address from headers if available
  BEGIN
    ip_address_text := current_setting('request.headers', true)::json->>'x-forwarded-for';
    IF ip_address_text IS NOT NULL THEN
      NEW.submission_ip := ip_address_text::inet;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Continue if IP extraction fails
    NULL;
  END;
  
  -- Log the submission for monitoring
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

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_set_lead_submission_ip ON leads;
DROP TRIGGER IF EXISTS trigger_prevent_duplicate_leads ON leads;

CREATE TRIGGER trigger_set_lead_metadata
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION set_lead_metadata();