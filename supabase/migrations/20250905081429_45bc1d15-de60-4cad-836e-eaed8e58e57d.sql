-- Create a secure function to get trainee profiles only
CREATE OR REPLACE FUNCTION public.get_trainee_profiles_secure()
RETURNS TABLE (
  user_id uuid,
  name text,
  email text,
  phone text,
  company text,
  created_at timestamp with time zone,
  role text,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to access this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Log the access for audit purposes
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details,
    logged_via_secure_function
  ) VALUES (
    auth.uid(),
    'trainee_profiles_accessed',
    'low',
    jsonb_build_object(
      'admin_user', auth.uid(),
      'access_type', 'trainee_list_view',
      'timestamp', now()
    ),
    true
  );

  -- Return only users with trainee role
  RETURN QUERY
  SELECT 
    p.user_id,
    p.name,
    p.email,
    p.phone,
    p.company,
    p.created_at,
    ur.role,
    ur.is_active
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.user_id = ur.user_id
  WHERE ur.role = 'trainee' 
    AND ur.is_active = true
  ORDER BY p.name;
END;
$$;