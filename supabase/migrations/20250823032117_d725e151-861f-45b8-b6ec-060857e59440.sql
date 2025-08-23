-- Create a function to get profiles with roles for admin dashboard
CREATE OR REPLACE FUNCTION public.get_profiles_with_roles()
RETURNS TABLE (
  user_id uuid,
  profile_name text,
  profile_email text,
  profile_phone text,
  profile_title text,
  profile_company text,
  profile_city text,
  profile_state text,
  profile_join_date timestamp with time zone,
  profile_created_at timestamp with time zone,
  profile_updated_at timestamp with time zone,
  role text,
  role_id uuid,
  role_is_active boolean,
  role_created_at timestamp with time zone,
  role_updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return profiles with their roles
  RETURN QUERY
  SELECT 
    p.user_id,
    p.name as profile_name,
    p.email as profile_email,
    p.phone as profile_phone,
    p.title as profile_title,
    p.company as profile_company,
    p.city as profile_city,
    p.state as profile_state,
    p.join_date as profile_join_date,
    p.created_at as profile_created_at,
    p.updated_at as profile_updated_at,
    ur.role,
    ur.id as role_id,
    ur.is_active as role_is_active,
    ur.created_at as role_created_at,
    ur.updated_at as role_updated_at
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
  ORDER BY p.created_at DESC;
END;
$$;