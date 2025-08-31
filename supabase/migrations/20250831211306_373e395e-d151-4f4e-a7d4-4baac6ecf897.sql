-- Fix remaining ambiguous column reference in get_secure_admin_profiles
-- The issue might be in variable names conflicting with column names
DROP FUNCTION IF EXISTS public.get_secure_admin_profiles();

CREATE OR REPLACE FUNCTION public.get_secure_admin_profiles()
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  phone text,
  title text,
  company text,
  city text,
  state text,
  role text,
  is_masked boolean,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Get current user's role (renamed variable to avoid conflicts)
  SELECT public.get_user_role_secure() INTO current_user_role;
  
  -- Only super admins can access this function
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required';
  END IF;

  -- Log the admin access
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'bulk_profile_access',
    'profiles',
    jsonb_build_object(
      'action', 'admin_profile_list_access',
      'timestamp', now(),
      'requesting_role', current_user_role,
      'access_type', 'bulk_secured_profiles'
    ),
    'confidential'
  );

  -- Return secured profile data with explicitly qualified columns
  RETURN QUERY
  SELECT 
    profiles.user_id,  -- Fully qualified column name
    CASE 
      WHEN current_user_role = 'super_admin' THEN profiles.name
      ELSE public.mask_sensitive_data(profiles.name, 'name', current_user_role)
    END as name,
    CASE 
      WHEN current_user_role = 'super_admin' THEN profiles.email
      ELSE public.mask_sensitive_data(profiles.email, 'email', current_user_role)
    END as email,
    CASE 
      WHEN current_user_role = 'super_admin' THEN profiles.phone
      ELSE public.mask_sensitive_data(profiles.phone, 'phone', current_user_role)
    END as phone,
    profiles.title,
    profiles.company,
    profiles.city,
    profiles.state,
    COALESCE(roles.role, 'user') as role,
    (current_user_role != 'super_admin') as is_masked,
    profiles.created_at
  FROM public.profiles profiles
  LEFT JOIN public.user_roles roles ON profiles.user_id = roles.user_id AND roles.is_active = true
  ORDER BY profiles.created_at DESC;
END;
$$;