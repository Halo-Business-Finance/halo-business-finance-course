-- Create a simple function to check current user's admin status
CREATE OR REPLACE FUNCTION public.check_current_user_admin_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id UUID;
  user_roles_data jsonb;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', false,
      'user_id', null,
      'roles', '[]'::jsonb,
      'is_admin', false
    );
  END IF;
  
  -- Get all roles for the current user
  SELECT jsonb_agg(
    jsonb_build_object(
      'role', role,
      'is_active', is_active,
      'created_at', created_at
    )
  ) INTO user_roles_data
  FROM public.user_roles 
  WHERE user_id = current_user_id;
  
  -- Return comprehensive status
  RETURN jsonb_build_object(
    'authenticated', true,
    'user_id', current_user_id,
    'roles', COALESCE(user_roles_data, '[]'::jsonb),
    'is_admin', EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = current_user_id 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
  );
END;
$$;