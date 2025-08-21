-- Fix the remaining search_path warning for validate_role_assignment function
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prevent users from assigning themselves admin roles
  IF NEW.user_id = auth.uid() AND NEW.role IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Users cannot assign admin roles to themselves';
  END IF;
  
  -- Only super_admin can assign super_admin roles
  IF NEW.role = 'super_admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Only super admins can assign super admin roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;