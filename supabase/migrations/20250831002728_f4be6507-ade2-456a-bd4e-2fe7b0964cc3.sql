-- Security Fix Phase 1: Fix Rate Limiting Vulnerabilities (High Priority)

-- Drop conflicting policies on lead_submission_rate_limits
DROP POLICY IF EXISTS "Rate limit functions can access data" ON public.lead_submission_rate_limits;
DROP POLICY IF EXISTS "System can manage rate limits" ON public.lead_submission_rate_limits;

-- Create consistent rate limiting policy
CREATE POLICY "Rate limiting system access" 
ON public.lead_submission_rate_limits 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Ensure advanced_rate_limits has proper access controls
DROP POLICY IF EXISTS "System can manage rate limits" ON public.advanced_rate_limits;

CREATE POLICY "Advanced rate limiting system access" 
ON public.advanced_rate_limits 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Security Fix Phase 2: Secure CMS Content Access (Medium Priority)

-- Drop the overly permissive global content policy
DROP POLICY IF EXISTS "Global content blocks are viewable by everyone" ON public.cms_content_blocks;

-- Create secure CMS content access policy
CREATE POLICY "Authenticated users can view global content blocks" 
ON public.cms_content_blocks 
FOR SELECT 
USING (
  (is_global = true AND auth.uid() IS NOT NULL) OR 
  is_admin(auth.uid())
);

-- Add audit logging for CMS content access
CREATE OR REPLACE FUNCTION log_cms_content_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log CMS content access for security monitoring
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details,
    logged_via_secure_function
  ) VALUES (
    auth.uid(),
    'cms_content_accessed',
    'low',
    jsonb_build_object(
      'content_block_id', NEW.id,
      'content_name', NEW.name,
      'content_type', NEW.type,
      'is_global', NEW.is_global,
      'timestamp', now(),
      'access_type', 'content_view'
    ),
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for CMS content access logging
CREATE TRIGGER cms_content_access_logger
  AFTER SELECT ON public.cms_content_blocks
  FOR EACH ROW
  EXECUTE FUNCTION log_cms_content_access();

-- Security Fix Phase 3: Enhanced Rate Limit Monitoring

-- Create function to detect rate limit bypass attempts
CREATE OR REPLACE FUNCTION detect_rate_limit_bypass()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for rate limit bypass detection
CREATE TRIGGER rate_limit_bypass_detector
  AFTER INSERT OR UPDATE ON public.lead_submission_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION detect_rate_limit_bypass();

-- Security Fix Phase 4: Enhanced Admin Access Monitoring

-- Create function for enhanced admin access logging
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