-- Create secure RPC function to get user roles data for admin dashboard

CREATE OR REPLACE FUNCTION public.get_admin_user_roles_data()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  role text,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  profile_name text,
  profile_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return user roles with profile data
  RETURN QUERY
  SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.is_active,
    ur.created_at,
    ur.updated_at,
    p.name as profile_name,
    p.email as profile_email
  FROM public.user_roles ur
  LEFT JOIN public.profiles p ON ur.user_id = p.user_id
  ORDER BY ur.created_at DESC;
END;
$function$;

-- Also create function to get all profiles (including those without roles)
CREATE OR REPLACE FUNCTION public.get_admin_all_users()
RETURNS TABLE(
  user_id uuid,
  profile_name text,
  profile_email text,
  profile_created_at timestamp with time zone,
  role text,
  role_is_active boolean,
  role_created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return all profiles with their roles (if any)
  RETURN QUERY
  SELECT 
    p.user_id,
    p.name as profile_name,
    p.email as profile_email,
    p.created_at as profile_created_at,
    COALESCE(ur.role, 'No role assigned') as role,
    COALESCE(ur.is_active, false) as role_is_active,
    ur.created_at as role_created_at
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
  ORDER BY p.created_at DESC;
END;
$function$;