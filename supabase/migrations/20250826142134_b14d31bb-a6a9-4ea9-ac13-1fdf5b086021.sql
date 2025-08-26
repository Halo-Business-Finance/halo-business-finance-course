-- Fix security linter warnings: Add search_path to functions

-- Fix the validate_course_content_access function
CREATE OR REPLACE FUNCTION public.validate_course_content_access(
  module_id text, 
  requested_fields text[] DEFAULT ARRAY['basic']
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  module_classification text;
  requires_enrollment boolean;
  user_enrolled boolean := false;
BEGIN
  -- Get module classification
  SELECT content_classification, 
         (security_metadata->>'requires_enrollment')::boolean
  INTO module_classification, requires_enrollment
  FROM public.course_modules 
  WHERE course_modules.module_id = validate_course_content_access.module_id;
  
  -- If module doesn't exist, deny access
  IF module_classification IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user is enrolled if required
  IF requires_enrollment AND auth.uid() IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM course_enrollments 
      WHERE user_id = auth.uid() AND status = 'active'
    ) INTO user_enrolled;
  END IF;
  
  -- Admin access
  IF is_admin(auth.uid()) THEN
    RETURN true;
  END IF;
  
  -- Preview content - allow basic fields only
  IF module_classification = 'preview' THEN
    RETURN array_length(requested_fields, 1) <= 5; -- Limit to basic marketing fields
  END IF;
  
  -- Restricted content - require enrollment
  IF module_classification = 'restricted' THEN
    RETURN user_enrolled;
  END IF;
  
  RETURN false;
END;
$$;

-- Fix the validate_course_module_input function
CREATE OR REPLACE FUNCTION public.validate_course_module_input()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate title length and content
  IF LENGTH(NEW.title) < 3 OR LENGTH(NEW.title) > 200 THEN
    RAISE EXCEPTION 'Course module title must be between 3 and 200 characters';
  END IF;
  
  -- Sanitize description if provided
  IF NEW.description IS NOT NULL THEN
    NEW.description := substring(NEW.description, 1, 1000);
  END IF;
  
  -- Validate order_index
  IF NEW.order_index < 0 OR NEW.order_index > 1000 THEN
    RAISE EXCEPTION 'Order index must be between 0 and 1000';
  END IF;
  
  -- Log security event for module changes
  IF TG_OP = 'UPDATE' AND auth.uid() IS NOT NULL THEN
    INSERT INTO public.security_events (user_id, event_type, severity, details)
    VALUES (
      auth.uid(),
      'course_module_modified',
      'medium',
      jsonb_build_object(
        'module_id', NEW.module_id,
        'action', TG_OP,
        'classification', NEW.content_classification,
        'admin_user', is_admin(auth.uid())
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix the log_course_access_attempt function
CREATE OR REPLACE FUNCTION public.log_course_access_attempt(
  module_id text,
  access_type text,
  success boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details,
    logged_via_secure_function
  ) VALUES (
    auth.uid(),
    'course_content_access_attempt',
    CASE WHEN success THEN 'low' ELSE 'medium' END,
    jsonb_build_object(
      'module_id', module_id,
      'access_type', access_type,
      'success', success,
      'timestamp', now(),
      'user_authenticated', auth.uid() IS NOT NULL,
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
    ),
    true
  );
END;
$$;