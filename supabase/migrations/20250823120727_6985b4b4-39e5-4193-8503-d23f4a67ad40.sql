-- Create a secure function to get all user profiles with their roles for admin dashboard
CREATE OR REPLACE FUNCTION public.get_all_user_profiles_with_roles()
 RETURNS TABLE(
   user_id uuid,
   name text,
   email text,
   phone text,
   title text,
   company text,
   created_at timestamp with time zone,
   updated_at timestamp with time zone,
   role text,
   role_is_active boolean,
   role_created_at timestamp with time zone
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admins and super admins to access this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Log the admin access
  INSERT INTO public.security_events (event_type, severity, details, user_id, logged_via_secure_function)
  VALUES (
    'admin_accessed_all_user_profiles',
    'medium',
    jsonb_build_object(
      'access_type', 'bulk_user_profile_access',
      'timestamp', now(),
      'admin_user', auth.uid(),
      'function_name', 'get_all_user_profiles_with_roles'
    ),
    auth.uid(),
    true
  );

  -- Return all profiles with their roles
  RETURN QUERY
  SELECT 
    p.user_id,
    p.name,
    p.email,
    p.phone,
    p.title,
    p.company,
    p.created_at,
    p.updated_at,
    COALESCE(ur.role, 'trainee') as role,
    COALESCE(ur.is_active, true) as role_is_active,
    ur.created_at as role_created_at
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
  ORDER BY p.created_at DESC;
END;
$function$;