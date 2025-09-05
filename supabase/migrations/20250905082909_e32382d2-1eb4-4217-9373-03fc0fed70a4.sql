-- Fix the admin status check function to properly return role information
CREATE OR REPLACE FUNCTION public.check_current_user_admin_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_roles_data jsonb;
  is_admin_user boolean;
  primary_role text;
BEGIN
  -- Get the current authenticated user ID
  current_user_id := auth.uid();
  
  -- If no authenticated user, return default
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'user_id', null,
      'is_admin', false,
      'role', 'anonymous',
      'roles', '[]'::jsonb
    );
  END IF;

  -- Get all active roles for the user
  SELECT jsonb_agg(
    jsonb_build_object(
      'role', ur.role,
      'is_active', ur.is_active
    )
  ) INTO user_roles_data
  FROM user_roles ur
  WHERE ur.user_id = current_user_id
    AND ur.is_active = true;

  -- If no roles found, return trainee as default
  IF user_roles_data IS NULL OR jsonb_array_length(user_roles_data) = 0 THEN
    RETURN jsonb_build_object(
      'user_id', current_user_id,
      'is_admin', false,
      'role', 'trainee',
      'roles', '[]'::jsonb
    );
  END IF;

  -- Determine if user is admin and get primary role
  SELECT 
    bool_or(ur.role IN ('super_admin', 'admin', 'tech_support_admin')),
    (ARRAY_AGG(ur.role ORDER BY 
      CASE ur.role 
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'tech_support_admin' THEN 3
        WHEN 'instructor' THEN 4
        WHEN 'trainee' THEN 5
        ELSE 6
      END
    ))[1]
  INTO is_admin_user, primary_role
  FROM user_roles ur
  WHERE ur.user_id = current_user_id
    AND ur.is_active = true;

  RETURN jsonb_build_object(
    'user_id', current_user_id,
    'is_admin', COALESCE(is_admin_user, false),
    'role', COALESCE(primary_role, 'trainee'),
    'roles', COALESCE(user_roles_data, '[]'::jsonb)
  );
END;
$$;