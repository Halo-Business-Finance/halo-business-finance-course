-- Fix 4: Add monitoring and error prevention for auth and permission issues

-- Create a function to log successful authentications to balance error tracking
CREATE OR REPLACE FUNCTION public.log_successful_auth(auth_type text, user_email text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_events (user_id, event_type, severity, details, logged_via_secure_function)
  VALUES (
    auth.uid(), 
    'successful_authentication', 
    'low', 
    jsonb_build_object(
      'auth_type', auth_type,
      'user_email', user_email,
      'timestamp', now(),
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for',
      'success', true
    ),
    true
  );
END;
$$;

-- Create function to monitor and alert on permission denied errors
CREATE OR REPLACE FUNCTION public.create_permission_alert(table_name text, user_id_attempted uuid, error_context text DEFAULT 'Unknown context')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the permission denial
  INSERT INTO public.security_events (user_id, event_type, severity, details, logged_via_secure_function)
  VALUES (
    user_id_attempted, 
    'permission_denied_alert', 
    'medium', 
    jsonb_build_object(
      'table_accessed', table_name,
      'user_attempted', user_id_attempted,
      'error_context', error_context,
      'timestamp', now(),
      'requires_investigation', true
    ),
    true
  );
  
  -- Create security alert for repeated permission denials
  IF (
    SELECT COUNT(*) 
    FROM public.security_events 
    WHERE user_id = user_id_attempted 
    AND event_type = 'permission_denied_alert' 
    AND created_at > now() - interval '1 hour'
  ) >= 5 THEN
    
    PERFORM create_security_alert(
      'repeated_permission_denials',
      'high',
      'Repeated Permission Denied Errors',
      format('User %s has encountered %s permission denied errors in the last hour. This may indicate misconfigured RLS policies or unauthorized access attempts.', 
             user_id_attempted, 
             (SELECT COUNT(*) FROM public.security_events WHERE user_id = user_id_attempted AND event_type = 'permission_denied_alert' AND created_at > now() - interval '1 hour')),
      jsonb_build_object(
        'user_id', user_id_attempted,
        'error_count_last_hour', (SELECT COUNT(*) FROM public.security_events WHERE user_id = user_id_attempted AND event_type = 'permission_denied_alert' AND created_at > now() - interval '1 hour'),
        'requires_rls_review', true,
        'alert_level', 'high'
      )
    );
  END IF;
END;
$$;

-- Create function to validate user session and prevent stale auth issues  
CREATE OR REPLACE FUNCTION public.validate_user_session()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_exists boolean;
BEGIN
  -- Get current user from auth context
  current_user_id := auth.uid();
  
  -- If no auth context, return false
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user exists in profiles table (our application user table)
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE user_id = current_user_id
  ) INTO user_exists;
  
  -- Log session validation
  INSERT INTO public.security_events (user_id, event_type, severity, details, logged_via_secure_function)
  VALUES (
    current_user_id, 
    'session_validation', 
    'low', 
    jsonb_build_object(
      'user_id', current_user_id,
      'user_exists_in_profiles', user_exists,
      'timestamp', now(),
      'validation_result', user_exists
    ),
    true
  );
  
  RETURN user_exists;
END;
$$;

-- Create trigger to automatically create profile when auth user is created
-- This prevents the "permission denied for table profiles" errors
CREATE OR REPLACE FUNCTION public.handle_new_user_enhanced()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile with comprehensive error handling
  BEGIN
    INSERT INTO public.profiles (user_id, name, email, join_date)
    VALUES (
      NEW.id, 
      COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name', 
        split_part(NEW.email, '@', 1),
        'New User'
      ),
      NEW.email,
      now()
    );
    
    -- Log successful profile creation
    INSERT INTO public.security_events (user_id, event_type, severity, details, logged_via_secure_function)
    VALUES (
      NEW.id, 
      'profile_created_automatically', 
      'low', 
      jsonb_build_object(
        'user_id', NEW.id,
        'email', NEW.email,
        'timestamp', now(),
        'trigger_source', 'auth_user_creation'
      ),
      true
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Log profile creation failure
    INSERT INTO public.security_events (user_id, event_type, severity, details, logged_via_secure_function)
    VALUES (
      NEW.id, 
      'profile_creation_failed', 
      'high', 
      jsonb_build_object(
        'user_id', NEW.id,
        'email', NEW.email,
        'error_message', SQLERRM,
        'timestamp', now(),
        'requires_manual_intervention', true
      ),
      true
    );
    
    -- Re-raise the exception to prevent auth user creation if profile fails
    RAISE;
  END;
  
  RETURN NEW;
END;
$$;

-- Update the existing trigger or create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_enhanced();