-- Drop existing function first
DROP FUNCTION IF EXISTS public.mask_sensitive_data(text, text, text);

-- Priority 1: Enhanced Customer Data Protection

-- Create function to mask sensitive PII data based on user role
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  data_text text,
  data_type text,
  user_role text DEFAULT 'user'
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Super admins see everything
  IF user_role = 'super_admin' THEN
    RETURN data_text;
  END IF;
  
  -- Admins see partial data
  IF user_role = 'admin' THEN
    CASE data_type
      WHEN 'email' THEN
        RETURN CASE 
          WHEN data_text IS NULL THEN NULL
          WHEN length(data_text) <= 3 THEN '***@***.***'
          ELSE substring(data_text from 1 for 3) || '***@' || split_part(data_text, '@', 2)
        END;
      WHEN 'phone' THEN
        RETURN CASE 
          WHEN data_text IS NULL THEN NULL
          WHEN length(data_text) <= 4 THEN 'XXX-XXX-XXXX'
          ELSE 'XXX-XXX-' || right(data_text, 4)
        END;
      WHEN 'name' THEN
        RETURN CASE 
          WHEN data_text IS NULL THEN NULL
          WHEN length(data_text) <= 2 THEN 'XX'
          ELSE left(data_text, 2) || repeat('X', length(data_text) - 2)
        END;
      ELSE
        RETURN '*** PROTECTED ***';
    END CASE;
  END IF;
  
  -- Regular users cannot see other users' data
  RETURN '*** RESTRICTED ***';
END;
$$;