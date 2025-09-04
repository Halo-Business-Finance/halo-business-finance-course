-- Enhanced function to get user profiles with proper masking and audit logging
CREATE OR REPLACE FUNCTION public.get_masked_user_profiles()
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  phone text,
  company text,
  created_at timestamp with time zone,
  is_masked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Get current user role
  SELECT role INTO current_user_role
  FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND is_active = true 
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      ELSE 3
    END
  LIMIT 1;

  -- Only allow admin access
  IF current_user_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required for customer data access';
  END IF;

  -- Log the access attempt with detailed audit trail
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'bulk_customer_pii_access',
    'profiles_table',
    jsonb_build_object(
      'access_type', 'masked_profiles_view',
      'role_level', current_user_role,
      'timestamp', now(),
      'data_sensitivity', 'confidential',
      'compliance_note', 'bulk_customer_data_access',
      'masking_applied', CASE WHEN current_user_role != 'super_admin' THEN true ELSE false END
    ),
    'confidential'
  );

  -- Return masked or unmasked data based on role
  RETURN QUERY
  SELECT 
    p.user_id::uuid,
    public.mask_sensitive_data(p.name, 'name', current_user_role)::text as name,
    public.mask_sensitive_data(p.email, 'email', current_user_role)::text as email,
    public.mask_sensitive_data(p.phone, 'phone', current_user_role)::text as phone,
    p.company::text,
    p.created_at::timestamp with time zone,
    (current_user_role != 'super_admin')::boolean as is_masked
  FROM public.profiles p
  WHERE p.user_id IS NOT NULL
  ORDER BY p.created_at DESC;
END;
$$;