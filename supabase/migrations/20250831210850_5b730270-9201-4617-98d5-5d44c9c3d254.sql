-- Fix duplicate function definition that causes ambiguity
-- Drop all versions of get_secure_admin_profiles to resolve conflicts
DROP FUNCTION IF EXISTS public.get_secure_admin_profiles();
DROP FUNCTION IF EXISTS public.get_secure_admin_profiles(text);

-- Create single, consistent version with proper security
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
  requesting_user_role text;
BEGIN
  -- Get current user's role
  SELECT get_user_role_secure() INTO requesting_user_role;
  
  -- Only super admins can access this function
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
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
      'requesting_role', requesting_user_role,
      'access_type', 'bulk_secured_profiles'
    ),
    'confidential'
  );

  -- Return secured profile data
  RETURN QUERY
  SELECT 
    p.user_id,
    CASE 
      WHEN requesting_user_role = 'super_admin' THEN p.name
      ELSE mask_sensitive_data(p.name, 'name', requesting_user_role)
    END as name,
    CASE 
      WHEN requesting_user_role = 'super_admin' THEN p.email
      ELSE mask_sensitive_data(p.email, 'email', requesting_user_role)
    END as email,
    CASE 
      WHEN requesting_user_role = 'super_admin' THEN p.phone
      ELSE mask_sensitive_data(p.phone, 'phone', requesting_user_role)
    END as phone,
    p.title,
    p.company,
    p.city,
    p.state,
    COALESCE(ur.role, 'user') as role,
    (requesting_user_role != 'super_admin') as is_masked,
    p.created_at
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
  ORDER BY p.created_at DESC;
END;
$$;