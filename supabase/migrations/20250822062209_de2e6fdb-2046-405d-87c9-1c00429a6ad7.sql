-- Drop existing function and recreate with correct return type

DROP FUNCTION IF EXISTS public.get_profile_encryption_stats();

CREATE OR REPLACE FUNCTION public.get_profile_encryption_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  encrypted_count INTEGER;
  total_count INTEGER;
BEGIN
  -- Count encrypted profiles
  SELECT COUNT(*) INTO encrypted_count
  FROM profiles 
  WHERE encryption_status = 'completed';
  
  -- Count total profiles
  SELECT COUNT(*) INTO total_count
  FROM profiles;
  
  -- Return in the format expected by the frontend
  RETURN jsonb_build_object(
    'encrypted_count', encrypted_count,
    'total_count', total_count
  );
END;
$function$;