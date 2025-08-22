-- Create a special function for initial admin setup that bypasses the self-assignment restriction
CREATE OR REPLACE FUNCTION public.setup_initial_admin()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id UUID;
  admin_count INTEGER;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN 'No authenticated user';
  END IF;
  
  -- Check if there are any existing super_admin users
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles 
  WHERE role = 'super_admin' AND is_active = true;
  
  -- Only allow this if there are no existing super admins (initial setup)
  IF admin_count > 0 THEN
    RETURN 'Admin users already exist. Use normal role assignment process.';
  END IF;
  
  -- Directly insert without triggering the validation (bypass the trigger)
  INSERT INTO public.user_roles (user_id, role, is_active, created_at, updated_at)
  VALUES (current_user_id, 'super_admin', true, now(), now())
  ON CONFLICT (user_id, role) 
  DO UPDATE SET is_active = true, updated_at = now();
  
  -- Log this action for security
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    target_resource,
    details,
    data_classification
  ) VALUES (
    current_user_id,
    'initial_admin_setup',
    current_user_id,
    'user_roles',
    jsonb_build_object(
      'action', 'initial_super_admin_assignment',
      'timestamp', now(),
      'setup_type', 'first_time_admin_bootstrap'
    ),
    'restricted'
  );
  
  RETURN 'Initial super admin role assigned to: ' || current_user_id;
END;
$$;

-- Update the role assignment trigger to allow the special setup function
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Allow the setup_initial_admin function to bypass restrictions
  IF current_setting('application_name', true) = 'setup_initial_admin' THEN
    RETURN NEW;
  END IF;
  
  -- Prevent users from assigning themselves admin roles (except during initial setup)
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