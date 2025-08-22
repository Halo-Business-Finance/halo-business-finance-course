-- Fix the RLS policy for profiles to use the secure function
DROP POLICY IF EXISTS "Admins can view all profiles for management" ON public.profiles;

CREATE POLICY "Admins can view all profiles for management" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
  )
);

-- Create a secure function to get profiles for admins
CREATE OR REPLACE FUNCTION public.get_profiles_with_roles()
RETURNS TABLE(
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
  role_id uuid,
  role text,
  role_is_active boolean,
  role_created_at timestamp with time zone,
  role_updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  ) THEN
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