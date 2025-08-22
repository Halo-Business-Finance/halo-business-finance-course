-- Create the missing RPC functions for admin operations
CREATE OR REPLACE FUNCTION assign_user_role(
  p_target_user_id UUID,
  p_new_role TEXT,
  p_reason TEXT DEFAULT 'Admin assignment',
  p_mfa_verified BOOLEAN DEFAULT false
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Check if trying to assign super_admin role
  IF p_new_role = 'super_admin' AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Only super admins can assign super admin roles';
  END IF;

  -- Deactivate existing roles for the user
  UPDATE user_roles 
  SET is_active = false, updated_at = now()
  WHERE user_id = p_target_user_id;

  -- Insert new role
  INSERT INTO user_roles (user_id, role, is_active, created_at, updated_at)
  VALUES (p_target_user_id, p_new_role, true, now(), now())
  ON CONFLICT (user_id, role) 
  DO UPDATE SET is_active = true, updated_at = now();

  -- Log the action
  PERFORM log_admin_action(
    'role_assignment',
    p_target_user_id,
    'user_roles',
    jsonb_build_object(
      'new_role', p_new_role,
      'reason', p_reason,
      'mfa_verified', p_mfa_verified
    )
  );

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION revoke_user_role(
  p_target_user_id UUID,
  p_reason TEXT DEFAULT 'Admin revocation',
  p_mfa_verified BOOLEAN DEFAULT false
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Prevent revoking own super admin role
  IF auth.uid() = p_target_user_id AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_target_user_id 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Cannot revoke your own super admin role';
  END IF;

  -- Deactivate all roles for the user
  UPDATE user_roles 
  SET is_active = false, updated_at = now()
  WHERE user_id = p_target_user_id AND is_active = true;

  -- Assign default trainee role
  INSERT INTO user_roles (user_id, role, is_active, created_at, updated_at)
  VALUES (p_target_user_id, 'trainee', true, now(), now())
  ON CONFLICT (user_id, role) 
  DO UPDATE SET is_active = true, updated_at = now();

  -- Log the action
  PERFORM log_admin_action(
    'role_revocation',
    p_target_user_id,
    'user_roles',
    jsonb_build_object(
      'reason', p_reason,
      'mfa_verified', p_mfa_verified
    )
  );

  RETURN TRUE;
END;
$$;