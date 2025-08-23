-- Add the missing check_current_user_admin_status function
CREATE OR REPLACE FUNCTION public.check_current_user_admin_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_admin_status boolean := false;
  user_roles_data jsonb := '[]'::jsonb;
  current_user_id uuid;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'is_admin', false,
      'roles', '[]'::jsonb
    );
  END IF;

  -- Check if user has admin privileges
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = current_user_id 
    AND role IN ('admin', 'super_admin', 'tech_support_admin') 
    AND is_active = true
  ) INTO user_admin_status;

  -- Get all user roles
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'role', role,
        'is_active', is_active
      )
    ),
    '[]'::jsonb
  )
  FROM public.user_roles 
  WHERE user_id = current_user_id
  INTO user_roles_data;

  -- Log the admin status check for security monitoring
  INSERT INTO public.security_events (user_id, event_type, severity, details)
  VALUES (
    current_user_id,
    'admin_status_check',
    'low',
    jsonb_build_object(
      'is_admin', user_admin_status,
      'roles_count', jsonb_array_length(user_roles_data),
      'timestamp', now()
    )
  );

  RETURN jsonb_build_object(
    'is_admin', user_admin_status,
    'roles', user_roles_data
  );
END;
$function$;

-- Add enhanced input validation function for XSS prevention
CREATE OR REPLACE FUNCTION public.validate_and_sanitize_input(input_text text, max_length integer DEFAULT 1000)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $function$
BEGIN
  -- Return null for null input
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check length
  IF length(input_text) > max_length THEN
    RAISE EXCEPTION 'Input exceeds maximum length of % characters', max_length;
  END IF;
  
  -- Remove potentially dangerous characters and patterns
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          trim(input_text),
          '<[^>]*>', '', 'g'  -- Remove HTML tags
        ),
        '[<>"\''&]', '', 'g'  -- Remove dangerous characters
      ),
      'javascript:', '', 'gi'  -- Remove javascript: protocols
    ),
    'data:', '', 'gi'  -- Remove data: URLs
  );
END;
$function$;

-- Add function to log security events from client-side
CREATE OR REPLACE FUNCTION public.log_client_security_event(
  event_type text,
  event_severity text,
  event_details jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  event_id uuid;
BEGIN
  -- Validate input
  IF event_type IS NULL OR event_severity IS NULL THEN
    RAISE EXCEPTION 'Event type and severity are required';
  END IF;
  
  -- Sanitize event type
  event_type := public.validate_and_sanitize_input(event_type, 100);
  
  -- Validate severity
  IF event_severity NOT IN ('low', 'medium', 'high', 'critical') THEN
    RAISE EXCEPTION 'Invalid severity level. Must be: low, medium, high, or critical';
  END IF;
  
  -- Insert security event
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details
  ) VALUES (
    auth.uid(),
    event_type,
    event_severity,
    COALESCE(event_details, '{}'::jsonb) || jsonb_build_object(
      'source', 'client',
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::json->>'user-agent'
    )
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$function$;

-- Add enhanced profile access validation with better error handling
CREATE OR REPLACE FUNCTION public.validate_secure_profile_access(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
  access_granted boolean := false;
  access_reason text := 'access_denied';
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Authentication check
  IF current_user_id IS NULL THEN
    -- Log unauthorized access attempt
    INSERT INTO public.security_events (event_type, severity, details)
    VALUES (
      'unauthenticated_profile_access_attempt',
      'critical',
      jsonb_build_object(
        'attempted_target', target_user_id,
        'timestamp', now(),
        'threat_level', 'critical'
      )
    );
    
    RETURN jsonb_build_object(
      'access_granted', false,
      'reason', 'authentication_required',
      'message', 'Authentication required for profile access'
    );
  END IF;

  -- Self-access check
  IF current_user_id = target_user_id THEN
    access_granted := true;
    access_reason := 'self_access';
  ELSE
    -- Admin access check
    IF is_admin(current_user_id) THEN
      access_granted := true;
      access_reason := 'admin_access';
      
      -- Log admin access
      PERFORM log_sensitive_data_access('profiles', target_user_id, 'Administrative profile access');
    END IF;
  END IF;
  
  -- Log access attempt
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details
  ) VALUES (
    current_user_id,
    CASE WHEN access_granted THEN 'profile_access_granted' ELSE 'profile_access_denied' END,
    CASE WHEN access_granted THEN 'low' ELSE 'high' END,
    jsonb_build_object(
      'target_user', target_user_id,
      'access_reason', access_reason,
      'access_granted', access_granted,
      'timestamp', now()
    )
  );
  
  RETURN jsonb_build_object(
    'access_granted', access_granted,
    'reason', access_reason,
    'message', CASE 
      WHEN access_granted THEN 'Access granted'
      ELSE 'Access denied - insufficient permissions'
    END
  );
END;
$function$;