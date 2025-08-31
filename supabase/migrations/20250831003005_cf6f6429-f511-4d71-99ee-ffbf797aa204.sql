-- Security Fixes Implementation - Comprehensive Update

-- Phase 1: Fix Rate Limiting RLS Policies
-- First ensure we drop any existing conflicting policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Rate limiting system access" ON public.lead_submission_rate_limits;
  DROP POLICY IF EXISTS "Advanced rate limiting system access" ON public.advanced_rate_limits;
  DROP POLICY IF EXISTS "Rate limit functions can access data" ON public.lead_submission_rate_limits;
  DROP POLICY IF EXISTS "System can manage rate limits" ON public.lead_submission_rate_limits;
  DROP POLICY IF EXISTS "System can manage rate limits" ON public.advanced_rate_limits;
END $$;

-- Create unified rate limiting policies
CREATE POLICY "unified_rate_limiting_access" 
ON public.lead_submission_rate_limits 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "unified_advanced_rate_limiting_access" 
ON public.advanced_rate_limits 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Phase 2: Secure CMS Content Access
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Global content blocks are viewable by everyone" ON public.cms_content_blocks;

-- Create secure CMS access policy requiring authentication
CREATE POLICY "secure_cms_content_access" 
ON public.cms_content_blocks 
FOR SELECT 
USING (
  (is_global = true AND auth.uid() IS NOT NULL) OR 
  is_admin(auth.uid())
);

-- Phase 3: Enhanced Security Monitoring Functions

-- Function to detect rate limit bypass attempts
CREATE OR REPLACE FUNCTION detect_rate_limit_bypass()
RETURNS TRIGGER AS $$
DECLARE
  bypass_attempts INTEGER;
BEGIN
  -- Check for potential bypass attempts
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for rate limit bypass detection
DROP TRIGGER IF EXISTS rate_limit_bypass_detector ON public.lead_submission_rate_limits;
CREATE TRIGGER rate_limit_bypass_detector
  AFTER INSERT OR UPDATE ON public.lead_submission_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION detect_rate_limit_bypass();

-- Function for enhanced admin access logging
CREATE OR REPLACE FUNCTION log_admin_sensitive_access(
  p_resource_type text,
  p_resource_id text,
  p_access_type text,
  p_data_accessed jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;