-- Drop existing function that has parameter name conflicts
DROP FUNCTION IF EXISTS public.log_pii_access_comprehensive(uuid,text,text[],text);

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