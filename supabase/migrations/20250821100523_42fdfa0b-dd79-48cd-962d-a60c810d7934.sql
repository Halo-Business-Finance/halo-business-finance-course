-- Create a function to get profiles with their roles for admin dashboard
CREATE OR REPLACE FUNCTION public.get_profiles_with_roles()
RETURNS TABLE (
  user_id UUID,
  profile_name TEXT,
  profile_email TEXT,
  profile_phone TEXT,
  profile_title TEXT,
  profile_company TEXT,
  profile_city TEXT,
  profile_state TEXT,
  profile_join_date TIMESTAMP WITH TIME ZONE,
  profile_created_at TIMESTAMP WITH TIME ZONE,
  profile_updated_at TIMESTAMP WITH TIME ZONE,
  role_id UUID,
  role TEXT,
  role_is_active BOOLEAN,
  role_created_at TIMESTAMP WITH TIME ZONE,
  role_updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

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
    ur.id as role_id,
    ur.role,
    ur.is_active as role_is_active,
    ur.created_at as role_created_at,
    ur.updated_at as role_updated_at
  FROM profiles p
  LEFT JOIN user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
  ORDER BY p.name;
END;
$$;