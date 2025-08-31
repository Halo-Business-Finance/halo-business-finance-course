-- Critical Security Fixes Implementation
-- Phase 1: Enhanced Data Protection with Masking and Audit Controls

-- 1. Enhanced data masking function with better security
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  p_data TEXT, 
  p_field_type TEXT, 
  p_requesting_user_role TEXT DEFAULT NULL
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only unmask for super_admin role
  IF p_requesting_user_role = 'super_admin' THEN
    RETURN p_data;
  END IF;
  
  -- Apply field-specific masking
  CASE p_field_type
    WHEN 'email' THEN
      IF p_data IS NULL THEN RETURN NULL; END IF;
      RETURN substring(p_data, 1, 2) || '***@' || split_part(p_data, '@', 2);
    WHEN 'phone' THEN
      IF p_data IS NULL THEN RETURN NULL; END IF;
      RETURN 'XXX-XXX-' || RIGHT(p_data, 4);
    WHEN 'name' THEN
      IF p_data IS NULL THEN RETURN NULL; END IF;
      RETURN substring(p_data, 1, 1) || '*** ***';
    ELSE
      RETURN COALESCE(p_data, '***');
  END CASE;
END;
$$;

-- 2. Enhanced profile access function with comprehensive logging
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

-- 3. Enhanced detailed audit logging function
CREATE OR REPLACE FUNCTION public.log_admin_profile_access_detailed(
  target_user_id uuid,
  access_type text,
  fields_accessed text[],
  reason text DEFAULT 'Administrative review'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only log if current user is admin accessing another user's data
  IF auth.uid() != target_user_id AND is_admin(auth.uid()) THEN
    -- Create detailed audit log entry
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      'detailed_profile_pii_access',
      target_user_id,
      'profiles_sensitive_data',
      jsonb_build_object(
        'access_type', access_type,
        'timestamp', now(),
        'fields_accessed', fields_accessed,
        'access_reason', reason,
        'security_classification', 'confidential',
        'pii_accessed', true,
        'gdpr_relevant', true,
        'requires_justification', true,
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
      ),
      'confidential'
    );

    -- Create security event for monitoring
    INSERT INTO public.security_events (event_type, severity, details, user_id, logged_via_secure_function)
    VALUES (
      'admin_pii_access_detailed',
      'medium',
      jsonb_build_object(
        'admin_user', auth.uid(),
        'target_customer', target_user_id,
        'timestamp', now(),
        'access_type', access_type,
        'sensitive_fields', fields_accessed,
        'monitoring_required', true
      ),
      auth.uid(),
      true
    );
  END IF;
END;
$$;

-- 4. Secure leads access function with role-based masking
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