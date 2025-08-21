-- Create function to auto-assign default user role
CREATE OR REPLACE FUNCTION public.assign_default_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Assign default "user" role to new users (unless they already have a role)
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id 
    AND is_active = true
  ) THEN
    INSERT INTO user_roles (user_id, role, is_active)
    VALUES (NEW.user_id, 'user', true);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign user role when profile is created
DROP TRIGGER IF EXISTS assign_user_role_on_profile_creation ON profiles;
CREATE TRIGGER assign_user_role_on_profile_creation
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_user_role();

-- Backfill missing user roles for existing users without roles
INSERT INTO user_roles (user_id, role, is_active)
SELECT p.user_id, 'user', true
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
WHERE ur.user_id IS NULL;

-- Verify the backfill worked
SELECT 
  p.name, 
  p.email, 
  ur.role, 
  ur.is_active,
  ur.created_at as role_assigned_at
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
ORDER BY p.name;