-- Add tech_support_admin role to the system
-- This role allows technical personnel to have admin access for system monitoring and fixes

-- Update the default role assignment function to recognize tech_support_admin
DROP FUNCTION IF EXISTS public.assign_default_user_role();

CREATE OR REPLACE FUNCTION public.assign_default_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Assign default "trainee" role to new users (unless they already have a role)
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id 
    AND is_active = true
  ) THEN
    INSERT INTO user_roles (user_id, role, is_active)
    VALUES (NEW.user_id, 'trainee', true);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update validation function to accept tech_support_admin role
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Prevent users from assigning themselves admin roles
  IF NEW.user_id = auth.uid() AND NEW.role IN ('admin', 'super_admin', 'tech_support_admin') THEN
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

  -- Only super_admin or admin can assign tech_support_admin roles  
  IF NEW.role = 'tech_support_admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Only super admins or admins can assign tech support admin roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update is_admin function to include tech_support_admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = COALESCE(check_user_id, auth.uid())
    AND role IN ('admin', 'super_admin', 'tech_support_admin') 
    AND is_active = true
  );
$$;

-- Log this admin action
SELECT log_admin_action(
  'system_update',
  NULL,
  'user_roles',
  jsonb_build_object(
    'action', 'added_tech_support_admin_role',
    'description', 'Added tech_support_admin role for technical personnel to monitor and fix LMS',
    'timestamp', now()
  )
);