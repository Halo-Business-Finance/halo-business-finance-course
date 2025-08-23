-- Fix the validate_security_data_modification function to use the correct column name
CREATE OR REPLACE FUNCTION public.validate_security_data_modification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow modifications that come from secure logging
  IF TG_OP = 'INSERT' THEN
    -- For new entries, require they come from secure function or are properly validated
    IF NEW.logged_via_secure_function IS NOT TRUE 
       AND NEW.validation_signature IS NULL THEN
      
      -- Log suspicious insertion attempt
      INSERT INTO public.security_events (event_type, severity, details, logged_via_secure_function)
      VALUES (
        'suspicious_security_data_insertion',
        'critical',
        jsonb_build_object(
          'table_name', TG_TABLE_NAME,
          'timestamp', NOW(),
          'user_id', auth.uid(),
          'blocked_reason', 'missing_security_validation'
        ),
        true
      );
      
      RAISE EXCEPTION 'Security data insertion blocked: Missing validation from secure logging function';
    END IF;
  END IF;

  -- Block all updates and deletes for immutable entries
  IF TG_OP IN ('UPDATE', 'DELETE') AND 
     (OLD.immutable IS TRUE OR OLD.logged_via_secure_function IS TRUE) THEN
    
    -- Log tampering attempt
    INSERT INTO public.security_events (event_type, severity, details, logged_via_secure_function)
    VALUES (
      'security_data_tampering_attempt',
      'critical',
      jsonb_build_object(
        'operation', TG_OP,
        'table_name', TG_TABLE_NAME,
        'timestamp', NOW(),
        'user_id', auth.uid(),
        'blocked_reason', 'immutable_security_data'
      ),
      true
    );
    
    RAISE EXCEPTION 'Security data modification blocked: Immutable security data cannot be modified';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;