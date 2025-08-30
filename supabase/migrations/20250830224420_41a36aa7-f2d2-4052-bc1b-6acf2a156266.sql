-- CRITICAL SECURITY FIX: Enhanced Customer PII Protection (Fixed)
-- Drop existing function first to avoid conflicts
DROP FUNCTION IF EXISTS public.get_masked_user_profiles();

-- 1. Enhanced data masking function with role-based access
CREATE OR REPLACE FUNCTION public.get_masked_user_profiles()
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  phone text,
  location text,
  company text,
  role text,
  is_masked boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role text;
  is_super_admin boolean := false;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for profile access';
  END IF;

  -- Get current user role
  SELECT get_user_role() INTO current_user_role;
  
  -- Check if user is super admin
  is_super_admin := (current_user_role = 'super_admin');

  -- Log the profile access attempt with detailed metadata
  PERFORM log_admin_profile_access_detailed(
    NULL, -- target_user_id (null for bulk access)
    'bulk_profile_access',
    ARRAY['name', 'email', 'phone', 'location', 'company'],
    'Administrative profile review'
  );

  -- Return profiles with appropriate masking
  RETURN QUERY
  SELECT 
    p.user_id,
    CASE 
      WHEN is_super_admin THEN p.name
      ELSE mask_sensitive_data(p.name, 'name', current_user_role)
    END as name,
    CASE 
      WHEN is_super_admin THEN p.email
      ELSE mask_sensitive_data(p.email, 'email', current_user_role)
    END as email,
    CASE 
      WHEN is_super_admin THEN p.phone
      ELSE mask_sensitive_data(p.phone, 'phone', current_user_role)
    END as phone,
    CASE 
      WHEN is_super_admin THEN p.location
      ELSE mask_sensitive_data(p.location, 'text', current_user_role)
    END as location,
    CASE 
      WHEN is_super_admin THEN p.company
      ELSE mask_sensitive_data(p.company, 'text', current_user_role)
    END as company,
    COALESCE(ur.role, 'user') as role,
    NOT is_super_admin as is_masked
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
  WHERE secure_profile_access(p.user_id) = true
  ORDER BY p.name;
END;
$$;

-- 2. Enhanced lead data protection with role-based access
CREATE OR REPLACE FUNCTION public.get_secure_leads(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_status text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  company text,
  status text,
  created_at timestamp with time zone,
  is_masked boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role text;
  is_super_admin boolean := false;
  can_access_leads boolean := false;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for lead access';
  END IF;

  -- Get current user role
  SELECT get_user_role() INTO current_user_role;
  
  -- Check access permissions
  is_super_admin := (current_user_role = 'super_admin');
  can_access_leads := (current_user_role IN ('super_admin', 'admin', 'sales_admin'));

  IF NOT can_access_leads THEN
    RAISE EXCEPTION 'Insufficient permissions to access lead data';
  END IF;

  -- Log lead data access
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'lead_data_access',
    'leads_table',
    jsonb_build_object(
      'access_type', 'bulk_lead_access',
      'timestamp', now(),
      'limit', p_limit,
      'offset', p_offset,
      'status_filter', p_status,
      'user_role', current_user_role,
      'data_masked', NOT is_super_admin
    ),
    'confidential'
  );

  -- Return leads with appropriate masking
  RETURN QUERY
  SELECT 
    l.id,
    CASE 
      WHEN is_super_admin THEN l.first_name
      ELSE mask_sensitive_data(l.first_name, 'name', current_user_role)
    END as first_name,
    CASE 
      WHEN is_super_admin THEN l.last_name
      ELSE mask_sensitive_data(l.last_name, 'name', current_user_role)
    END as last_name,
    CASE 
      WHEN is_super_admin THEN l.email
      ELSE mask_sensitive_data(l.email, 'email', current_user_role)
    END as email,
    CASE 
      WHEN is_super_admin THEN l.phone
      ELSE mask_sensitive_data(l.phone, 'phone', current_user_role)
    END as phone,
    CASE 
      WHEN is_super_admin THEN l.company
      ELSE mask_sensitive_data(l.company, 'text', current_user_role)
    END as company,
    l.status,
    l.created_at,
    NOT is_super_admin as is_masked
  FROM public.leads l
  WHERE (p_status IS NULL OR l.status = p_status)
  ORDER BY l.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;