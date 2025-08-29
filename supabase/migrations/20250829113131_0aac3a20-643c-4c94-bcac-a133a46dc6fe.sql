-- Phase 1: Customer Data Protection & PII Masking

-- Create secure function for PII masking
CREATE OR REPLACE FUNCTION public.mask_pii_field(
  field_value text,
  field_type text,
  requesting_user_role text DEFAULT NULL
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only show full data to super_admin or when explicitly requested
  IF requesting_user_role = 'super_admin' THEN
    RETURN field_value;
  END IF;
  
  -- Apply field-specific masking
  CASE field_type
    WHEN 'email' THEN
      IF field_value IS NULL THEN RETURN NULL; END IF;
      RETURN substring(field_value, 1, 2) || '***@' || split_part(field_value, '@', 2);
    WHEN 'phone' THEN
      IF field_value IS NULL THEN RETURN NULL; END IF;
      RETURN 'XXX-XXX-' || RIGHT(field_value, 4);
    WHEN 'name' THEN
      IF field_value IS NULL THEN RETURN NULL; END IF;
      RETURN substring(field_value, 1, 1) || '*** ***';
    WHEN 'company' THEN
      IF field_value IS NULL THEN RETURN NULL; END IF;
      RETURN substring(field_value, 1, 3) || '***';
    ELSE
      RETURN COALESCE(field_value, '***');
  END CASE;
END;
$$;

-- Create comprehensive audit logging function for PII access
CREATE OR REPLACE FUNCTION public.log_pii_access_comprehensive(
  target_user_id uuid,
  access_type text,
  fields_accessed text[],
  access_reason text DEFAULT 'Administrative review'
) RETURNS void
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
      'pii_data_access_comprehensive',
      target_user_id,
      'customer_pii_fields',
      jsonb_build_object(
        'access_type', access_type,
        'timestamp', now(),
        'fields_accessed', fields_accessed,
        'access_reason', access_reason,
        'security_classification', 'confidential',
        'pii_accessed', true,
        'gdpr_relevant', true,
        'compliance_logging', true,
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
      ),
      'confidential'
    );

    -- Create security event for monitoring
    INSERT INTO public.security_events (event_type, severity, details, user_id, logged_via_secure_function)
    VALUES (
      'pii_access_comprehensive',
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

-- Create secure leads access function with PII masking
CREATE OR REPLACE FUNCTION public.get_leads_secure(
  include_full_pii boolean DEFAULT false,
  access_justification text DEFAULT 'Administrative review'
) RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  company text,
  job_title text,
  message text,
  status text,
  lead_type text,
  created_at timestamp with time zone,
  submission_ip inet
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Require admin access
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required for leads access';
  END IF;

  -- Get current user role for masking decisions
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

  -- Log the access attempt with comprehensive details
  INSERT INTO public.security_events (event_type, severity, details, user_id, logged_via_secure_function)
  VALUES (
    'leads_bulk_access',
    CASE WHEN include_full_pii THEN 'high' ELSE 'medium' END,
    jsonb_build_object(
      'admin_user', auth.uid(),
      'timestamp', now(),
      'access_type', 'leads_bulk_query',
      'include_full_pii', include_full_pii,
      'access_justification', access_justification,
      'user_role', current_user_role,
      'compliance_logging', true
    ),
    auth.uid(),
    true
  );

  -- Return data with conditional PII masking
  RETURN QUERY
  SELECT 
    l.id,
    CASE 
      WHEN include_full_pii AND current_user_role = 'super_admin' THEN l.first_name
      ELSE mask_pii_field(l.first_name, 'name', current_user_role)
    END as first_name,
    CASE 
      WHEN include_full_pii AND current_user_role = 'super_admin' THEN l.last_name
      ELSE mask_pii_field(l.last_name, 'name', current_user_role)
    END as last_name,
    CASE 
      WHEN include_full_pii AND current_user_role = 'super_admin' THEN l.email
      ELSE mask_pii_field(l.email, 'email', current_user_role)
    END as email,
    CASE 
      WHEN include_full_pii AND current_user_role = 'super_admin' THEN l.phone
      ELSE mask_pii_field(l.phone, 'phone', current_user_role)
    END as phone,
    CASE 
      WHEN include_full_pii AND current_user_role = 'super_admin' THEN l.company
      ELSE mask_pii_field(l.company, 'company', current_user_role)
    END as company,
    l.job_title,
    l.message,
    l.status,
    l.lead_type,
    l.created_at,
    l.submission_ip
  FROM public.leads l
  ORDER BY l.created_at DESC;
END;
$$;

-- Update leads RLS policy to be more restrictive
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

-- Create public-safe course modules view (without security metadata)
CREATE OR REPLACE FUNCTION public.get_course_modules_public()
RETURNS TABLE(
  id uuid,
  module_id text,
  title text,
  description text,
  duration text,
  skill_level text,
  order_index integer,
  is_active boolean,
  public_preview boolean,
  lessons_count integer,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- This function excludes all security-sensitive metadata
  RETURN QUERY
  SELECT 
    cm.id,
    cm.module_id,
    cm.title,
    cm.description,
    cm.duration,
    cm.skill_level::text,
    cm.order_index,
    cm.is_active,
    cm.public_preview,
    cm.lessons_count,
    cm.created_at
  FROM public.course_modules cm
  WHERE cm.is_active = true
  AND (
    cm.public_preview = true 
    OR is_admin(auth.uid())
    OR (
      auth.uid() IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.course_enrollments 
        WHERE user_id = auth.uid() 
        AND status = 'active'
      )
    )
  )
  ORDER BY cm.order_index;
END;
$$;

-- Phase 4: Enhanced Security Monitoring

-- Create function to monitor suspicious data access patterns
CREATE OR REPLACE FUNCTION public.monitor_profile_access_patterns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  suspicious_admin RECORD;
BEGIN
  -- Check for admins accessing too many customer profiles
  FOR suspicious_admin IN
    SELECT 
      admin_user_id,
      COUNT(DISTINCT target_user_id) as profiles_accessed,
      COUNT(*) as total_accesses,
      MIN(created_at) as first_access,
      MAX(created_at) as last_access
    FROM admin_audit_log 
    WHERE action LIKE '%profile%'
      AND created_at > now() - interval '1 hour'
    GROUP BY admin_user_id
    HAVING COUNT(DISTINCT target_user_id) >= 10  -- 10+ profiles in 1 hour = suspicious
  LOOP
    -- Create security alert for suspicious access
    PERFORM create_security_alert(
      'suspicious_profile_access_pattern',
      'high',
      'Suspicious Customer Profile Access Pattern Detected',
      format('SECURITY ALERT: Admin %s accessed %s customer profiles in the last hour (%s total operations). This may indicate unauthorized data scraping or breach attempt. Immediate review required.', 
             suspicious_admin.admin_user_id, 
             suspicious_admin.profiles_accessed,
             suspicious_admin.total_accesses),
      jsonb_build_object(
        'admin_user_id', suspicious_admin.admin_user_id,
        'profiles_accessed', suspicious_admin.profiles_accessed,
        'total_operations', suspicious_admin.total_accesses,
        'time_window', '1_hour',
        'alert_level', 'high',
        'requires_immediate_investigation', true,
        'potential_gdpr_violation', true,
        'access_pattern_duration_minutes', EXTRACT(EPOCH FROM (suspicious_admin.last_access - suspicious_admin.first_access))/60
      )
    );
  END LOOP;
END;
$$;