-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.check_user_has_role(check_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = check_role 
    AND is_active = true
  );
$$;

-- Also fix other functions with search path issues
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from assigning themselves admin roles
  IF NEW.user_id = auth.uid() AND NEW.role IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Users cannot assign admin roles to themselves';
  END IF;
  
  -- Only super_admin can assign super_admin roles
  IF NEW.role = 'super_admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Only super admins can assign super admin roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Phase 2: Strengthen profile data security and assessment integrity
-- Add validation for profile data access
CREATE OR REPLACE FUNCTION public.validate_profile_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log profile access attempts for security monitoring
  INSERT INTO public.security_events (user_id, event_type, severity, details)
  VALUES (auth.uid(), 'profile_accessed', 'low', jsonb_build_object(
    'accessed_user_id', NEW.user_id,
    'timestamp', now()
  ));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Add trigger for profile access logging
DROP TRIGGER IF EXISTS log_profile_access_trigger ON public.profiles;
CREATE TRIGGER log_profile_access_trigger
  AFTER SELECT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_access();

-- Strengthen assessment attempts validation
CREATE OR REPLACE FUNCTION public.validate_assessment_attempt()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent tampering with scores
  IF NEW.score < 0 OR NEW.score > 100 THEN
    RAISE EXCEPTION 'Invalid score range';
  END IF;
  
  -- Log assessment attempts for integrity monitoring
  INSERT INTO public.security_events (user_id, event_type, severity, details)
  VALUES (auth.uid(), 'assessment_attempt', 'medium', jsonb_build_object(
    'assessment_id', NEW.assessment_id,
    'score', NEW.score,
    'attempt_number', NEW.attempt_number,
    'timestamp', now()
  ));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Add trigger for assessment validation
DROP TRIGGER IF EXISTS validate_assessment_attempt_trigger ON public.assessment_attempts;
CREATE TRIGGER validate_assessment_attempt_trigger
  BEFORE INSERT OR UPDATE ON public.assessment_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_assessment_attempt();

-- Phase 3: Enhanced security monitoring
-- Create function to detect suspicious activity
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS TRIGGER AS $$
DECLARE
  recent_failed_attempts INTEGER;
BEGIN
  -- Count recent failed login attempts (this would be called from auth events)
  SELECT COUNT(*) INTO recent_failed_attempts
  FROM public.security_events
  WHERE user_id = NEW.user_id
  AND event_type = 'failed_login'
  AND created_at > (now() - INTERVAL '1 hour');
  
  -- If too many failed attempts, log high severity event
  IF recent_failed_attempts > 5 THEN
    INSERT INTO public.security_events (user_id, event_type, severity, details)
    VALUES (NEW.user_id, 'suspicious_activity', 'critical', jsonb_build_object(
      'reason', 'Multiple failed login attempts',
      'attempt_count', recent_failed_attempts,
      'timestamp', now()
    ));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Create additional security functions for monitoring
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  target_resource text,
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_events (user_id, event_type, severity, details)
  VALUES (auth.uid(), action_type, 'high', jsonb_build_object(
    'target_resource', target_resource,
    'action_details', details,
    'timestamp', now()
  ));
END;
$$;