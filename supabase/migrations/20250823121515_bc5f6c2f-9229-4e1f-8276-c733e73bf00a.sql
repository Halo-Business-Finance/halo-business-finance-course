-- Create secure function to check if current user can delete a target user
CREATE OR REPLACE FUNCTION public.can_delete_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Must be authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Cannot delete yourself
  IF auth.uid() = target_user_id THEN
    RETURN false;
  END IF;

  -- Only super_admin can delete users
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  );
END;
$function$;