-- Final fix for function search path security warning
-- Update all remaining functions that might be missing SET search_path

-- Fix the original functions that were created before our security updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_enroll_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Auto-enroll the new user
  INSERT INTO public.user_enrollments (user_id, enrollment_type)
  VALUES (NEW.id, 'automatic');
  
  RETURN NEW;
END;
$$;

-- Also fix detect_suspicious_activity to ensure it has the correct search path
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