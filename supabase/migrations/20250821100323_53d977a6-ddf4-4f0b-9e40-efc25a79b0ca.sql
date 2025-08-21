-- Valid roles are: admin, super_admin, manager, agent, viewer, loan_processor, underwriter, funder, closer, tech, loan_originator
-- Let's use 'viewer' as the default role for new users

-- Create function to auto-assign default viewer role
CREATE OR REPLACE FUNCTION public.assign_default_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Assign default "viewer" role to new users (unless they already have a role)
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id 
    AND is_active = true
  ) THEN
    INSERT INTO user_roles (user_id, role, is_active)
    VALUES (NEW.user_id, 'viewer', true);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign viewer role when profile is created
DROP TRIGGER IF EXISTS assign_user_role_on_profile_creation ON profiles;
CREATE TRIGGER assign_user_role_on_profile_creation
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_user_role();

-- Backfill missing user roles for existing users without roles
-- Assign 'viewer' role as the default for regular users
INSERT INTO user_roles (user_id, role, is_active)
SELECT p.user_id, 'viewer', true
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
WHERE ur.user_id IS NULL;