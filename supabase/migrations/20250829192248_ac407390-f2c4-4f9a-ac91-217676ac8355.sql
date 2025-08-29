-- Continue with Phase 1: Update leads RLS policy to be more restrictive
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Super admins can manage leads" ON public.leads;

-- Create more restrictive RLS policies for leads
CREATE POLICY "Only super admins can directly access leads table"
ON public.leads
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- Phase 2: Enhanced Profile Security

-- Create secure profile access function with comprehensive PII masking
CREATE OR REPLACE FUNCTION public.get_profiles_secure(
  target_user_id uuid DEFAULT NULL,
  include_sensitive_fields boolean DEFAULT false,
  access_justification text DEFAULT 'Administrative review'
) RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  title text,
  company text,
  city text,
  state text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Users can always access their own data without restrictions
  IF target_user_id IS NOT NULL AND auth.uid() = target_user_id THEN
    RETURN QUERY
    SELECT p.id, p.user_id, p.name, p.email, p.phone, p.title, 
           p.company, p.city, p.state, p.created_at
    FROM public.profiles p
    WHERE p.user_id = target_user_id;
    RETURN;
  END IF;

  -- For admin access to other users' data, require admin privileges
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required for profile access';
  END IF;

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

  -- Log comprehensive admin access
  IF target_user_id IS NOT NULL THEN
    PERFORM log_pii_access_comprehensive(
      target_user_id, 
      'profile_admin_access', 
      ARRAY['name', 'email', 'phone', 'company', 'city', 'state'], 
      access_justification
    );
  ELSE
    -- Log bulk access
    INSERT INTO public.security_events (event_type, severity, details, user_id, logged_via_secure_function)
    VALUES (
      'profiles_bulk_admin_access',
      'high',
      jsonb_build_object(
        'admin_user', auth.uid(),
        'timestamp', now(),
        'access_type', 'bulk_profile_access',
        'include_sensitive_fields', include_sensitive_fields,
        'access_justification', access_justification,
        'requires_monitoring', true
      ),
      auth.uid(),
      true
    );
  END IF;

  -- Return data with conditional masking
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    CASE 
      WHEN include_sensitive_fields AND current_user_role = 'super_admin' THEN p.name
      ELSE mask_pii_field(p.name, 'name', current_user_role)
    END as name,
    CASE 
      WHEN include_sensitive_fields AND current_user_role = 'super_admin' THEN p.email
      ELSE mask_pii_field(p.email, 'email', current_user_role)
    END as email,
    CASE 
      WHEN include_sensitive_fields AND current_user_role = 'super_admin' THEN p.phone
      ELSE mask_pii_field(p.phone, 'phone', current_user_role)
    END as phone,
    p.title,
    CASE 
      WHEN include_sensitive_fields AND current_user_role = 'super_admin' THEN p.company
      ELSE mask_pii_field(p.company, 'company', current_user_role)
    END as company,
    p.city,
    p.state,
    p.created_at
  FROM public.profiles p
  WHERE (target_user_id IS NULL OR p.user_id = target_user_id)
  ORDER BY p.created_at DESC;
END;
$$;

-- Phase 3: Security Metadata Protection for Course Modules

-- Create admin-only function for course module security metadata
CREATE OR REPLACE FUNCTION public.get_course_modules_with_security_metadata()
RETURNS TABLE(
  id uuid,
  module_id text,
  title text,
  description text,
  security_metadata jsonb,
  content_classification text,
  is_active boolean,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow super admins to access security metadata
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required for security metadata';
  END IF;

  -- Log access to security metadata
  INSERT INTO public.security_events (event_type, severity, details, user_id, logged_via_secure_function)
  VALUES (
    'security_metadata_access',
    'medium',
    jsonb_build_object(
      'admin_user', auth.uid(),
      'timestamp', now(),
      'access_type', 'course_security_metadata',
      'requires_monitoring', true
    ),
    auth.uid(),
    true
  );

  RETURN QUERY
  SELECT 
    cm.id,
    cm.module_id,
    cm.title,
    cm.description,
    cm.security_metadata,
    cm.content_classification,
    cm.is_active,
    cm.created_at
  FROM public.course_modules cm
  ORDER BY cm.order_index;
END;
$$;