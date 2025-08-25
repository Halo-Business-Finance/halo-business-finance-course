-- Fix the ambiguous column reference in get_masked_user_profiles function
CREATE OR REPLACE FUNCTION public.get_masked_user_profiles()
 RETURNS TABLE(user_id uuid, name text, email text, phone text, title text, company text, city text, state text, avatar_url text, join_date timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone, role text, role_is_active boolean, role_created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_role text;
  is_super_admin boolean := false;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for profile access';
  END IF;

  -- Check if user is super admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'super_admin' 
    AND user_roles.is_active = true
  ) INTO is_super_admin;

  -- Get current user role
  SELECT user_roles.role INTO current_user_role
  FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.is_active = true 
  ORDER BY 
    CASE user_roles.role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      ELSE 3
    END
  LIMIT 1;

  -- Log access attempt with enhanced details
  INSERT INTO public.security_events (event_type, severity, details, user_id, logged_via_secure_function)
  VALUES (
    'masked_profile_access',
    CASE WHEN is_super_admin THEN 'medium' ELSE 'low' END,
    jsonb_build_object(
      'access_type', 'bulk_profile_access_with_masking',
      'timestamp', now(),
      'user_role', current_user_role,
      'is_super_admin', is_super_admin,
      'data_protection_applied', NOT is_super_admin
    ),
    auth.uid(),
    true
  );

  -- Return masked or unmasked data based on permissions
  RETURN QUERY
  SELECT 
    p.user_id,
    CASE 
      WHEN is_super_admin OR p.user_id = auth.uid() THEN p.name
      ELSE public.mask_sensitive_data(p.name, 'name', current_user_role)
    END as name,
    CASE 
      WHEN is_super_admin OR p.user_id = auth.uid() THEN p.email
      ELSE public.mask_sensitive_data(p.email, 'email', current_user_role)
    END as email,
    CASE 
      WHEN is_super_admin OR p.user_id = auth.uid() THEN p.phone
      ELSE public.mask_sensitive_data(p.phone, 'phone', current_user_role)
    END as phone,
    p.title,
    p.company,
    p.city,
    p.state,
    p.avatar_url,
    p.join_date,
    p.created_at,
    p.updated_at,
    COALESCE(ur.role, 'trainee') as role,
    COALESCE(ur.is_active, true) as role_is_active,
    ur.created_at as role_created_at
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
  WHERE 
    -- Only admins can see all profiles, regular users see only their own
    (is_admin(auth.uid()) OR p.user_id = auth.uid())
  ORDER BY p.created_at DESC;
END;
$function$;