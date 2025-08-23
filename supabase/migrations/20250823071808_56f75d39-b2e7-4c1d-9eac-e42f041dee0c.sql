-- Fix search path security warning for the input validation function
CREATE OR REPLACE FUNCTION public.validate_and_sanitize_input(input_text text, max_length integer DEFAULT 1000)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
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