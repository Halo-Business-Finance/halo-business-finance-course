-- Fix the trigger syntax error and continue with security improvements
-- Remove the invalid SELECT trigger and focus on actionable security improvements

-- Phase 2: Strengthen assessment attempts validation (fixed)
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

-- Strengthen existing is_admin function with better security
DROP FUNCTION IF EXISTS public.is_admin(uuid);
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = COALESCE(check_user_id, auth.uid())
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  );
$$;

-- Strengthen existing get_user_role function
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = COALESCE(check_user_id, auth.uid())
  AND is_active = true 
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      ELSE 3
    END
  LIMIT 1;
$$;