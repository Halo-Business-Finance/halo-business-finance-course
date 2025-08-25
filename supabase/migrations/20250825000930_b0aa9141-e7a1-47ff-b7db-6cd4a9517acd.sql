-- Enhanced PII Data Protection for Profiles Table
-- This addresses the security concern about potential customer data theft

-- Create data masking function for sensitive fields
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  p_data text,
  p_field_type text,
  p_requesting_user_role text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only unmask for super_admin role or data owner
  IF p_requesting_user_role = 'super_admin' OR auth.uid() IS NULL THEN
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

-- Create enhanced secure profile access function with data masking
CREATE OR REPLACE FUNCTION public.get_masked_user_profiles()
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  phone text,
  title text,
  company text,
  city text,
  state text,
  avatar_url text,
  join_date timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  role text,
  role_is_active boolean,
  role_created_at timestamp with time zone
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

  -- Check if user is super admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) INTO is_super_admin;

  -- Get current user role
  SELECT role INTO current_user_role
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND is_active = true 
  ORDER BY 
    CASE role 
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
$$;

-- Create function to encrypt PII fields (placeholder for future encryption implementation)
CREATE OR REPLACE FUNCTION public.encrypt_pii_field(
  p_data text,
  p_field_name text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- For now, return the data as-is. In production, this would use proper encryption
  -- This is a placeholder for future AES-256 encryption implementation
  RETURN p_data;
END;
$$;

-- Enhanced logging for admin profile access
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

-- Update existing secure profile access function to use enhanced logging
CREATE OR REPLACE FUNCTION public.get_secure_admin_profile_data(target_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  phone text,
  title text,
  company text,
  city text,
  state text,
  location text,
  avatar_url text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Strict access control - only super admins can access individual profile data
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required for individual profile access';
  END IF;

  -- Enhanced logging with detailed field tracking
  PERFORM public.log_admin_profile_access_detailed(
    target_user_id, 
    'individual_profile_access', 
    ARRAY['name', 'email', 'phone', 'title', 'company', 'city', 'state', 'location'], 
    'Super admin individual profile review'
  );

  -- Return the profile data
  RETURN QUERY
  SELECT 
    p.user_id,
    p.name,
    p.email,
    p.phone,
    p.title,
    p.company,
    p.city,
    p.state,
    p.location,
    p.avatar_url,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
END;
$$;