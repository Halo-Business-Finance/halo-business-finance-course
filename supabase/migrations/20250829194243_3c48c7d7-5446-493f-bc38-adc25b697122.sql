-- Phase 1: Critical PII Protection - Secure Profile Access Functions

-- Drop existing insecure functions that expose PII
DROP FUNCTION IF EXISTS public.get_all_user_profiles_with_roles();
DROP FUNCTION IF EXISTS public.get_authenticated_user_profiles();

-- Create comprehensive PII protection function
CREATE OR REPLACE FUNCTION public.get_secure_admin_profiles(requesting_user_role text DEFAULT NULL)
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  phone text,
  title text,
  company text,
  city text,
  state text,
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
BEGIN
  -- Only allow admin access
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get the actual current user role
  SELECT public.get_user_role_secure() INTO current_user_role;
  
  -- Log comprehensive audit trail for admin profile access
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'bulk_customer_profile_access',
    'profiles_table_admin_view',
    jsonb_build_object(
      'access_type', 'admin_dashboard_bulk_access',
      'timestamp', now(),
      'requesting_role', current_user_role,
      'pii_fields_accessed', ARRAY['name', 'email', 'phone', 'title', 'company', 'city', 'state'],
      'data_classification', 'confidential',
      'compliance_note', 'admin_bulk_customer_data_access',
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
    ),
    'confidential'
  );

  -- Return masked or unmasked data based on role
  RETURN QUERY
  SELECT 
    p.user_id,
    CASE 
      WHEN current_user_role = 'super_admin' THEN p.name
      ELSE mask_sensitive_data(p.name, 'name', current_user_role)
    END as name,
    CASE 
      WHEN current_user_role = 'super_admin' THEN p.email
      ELSE mask_sensitive_data(p.email, 'email', current_user_role)
    END as email,
    CASE 
      WHEN current_user_role = 'super_admin' THEN p.phone
      ELSE mask_sensitive_data(p.phone, 'phone', current_user_role)
    END as phone,
    p.title,
    p.company,
    p.city,
    p.state,
    p.created_at,
    p.updated_at,
    COALESCE(ur.role, 'trainee') as role,
    COALESCE(ur.is_active, true) as role_is_active,
    ur.created_at as role_created_at
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
  ORDER BY p.created_at DESC;
END;
$$;

-- Create function to log PII access comprehensively
CREATE OR REPLACE FUNCTION public.log_pii_access_comprehensive(
  target_user_id uuid, 
  access_type text, 
  fields_accessed text[], 
  access_reason text DEFAULT 'administrative_review'
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
      'customer_pii_comprehensive_access',
      target_user_id,
      'profiles_sensitive_data',
      jsonb_build_object(
        'access_type', access_type,
        'timestamp', now(),
        'fields_accessed', fields_accessed,
        'access_reason', access_reason,
        'security_classification', 'confidential',
        'pii_accessed', true,
        'gdpr_relevant', true,
        'requires_justification', true,
        'compliance_framework', 'PII_PROTECTION',
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
      ),
      'confidential'
    );

    -- Check for suspicious bulk access patterns
    PERFORM detect_potential_data_breach();
  END IF;
END;
$$;

-- Create function to monitor profile access patterns  
CREATE OR REPLACE FUNCTION public.monitor_profile_access_patterns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  suspicious_admin RECORD;
BEGIN
  -- Detect admins accessing unusual numbers of profiles
  FOR suspicious_admin IN
    SELECT 
      admin_user_id,
      COUNT(DISTINCT target_user_id) as profiles_accessed,
      COUNT(*) as total_operations,
      MIN(created_at) as first_access,
      MAX(created_at) as last_access
    FROM admin_audit_log 
    WHERE action LIKE '%profile%'
      AND created_at > now() - interval '2 hours'
    GROUP BY admin_user_id
    HAVING COUNT(DISTINCT target_user_id) >= 10  -- 10+ profiles in 2 hours = suspicious
  LOOP
    -- Create security alert for suspicious pattern
    PERFORM create_security_alert(
      'suspicious_profile_access_pattern',
      'high',
      'Suspicious Profile Access Pattern Detected',
      format('Admin %s accessed %s customer profiles in 2 hours. This pattern requires investigation.', 
             suspicious_admin.admin_user_id, 
             suspicious_admin.profiles_accessed),
      jsonb_build_object(
        'admin_user_id', suspicious_admin.admin_user_id,
        'profiles_accessed', suspicious_admin.profiles_accessed,
        'total_operations', suspicious_admin.total_operations,
        'time_window', '2_hours',
        'alert_level', 'high',
        'requires_investigation', true,
        'potential_compliance_issue', true
      )
    );
  END LOOP;
END;
$$;

-- Update course modules to remove public preview access
UPDATE public.course_modules 
SET public_preview = false, 
    content_classification = 'restricted',
    security_metadata = jsonb_build_object(
      'access_level', 'enrolled_only',
      'ip_restrictions', false,
      'requires_enrollment', true
    )
WHERE public_preview = true;

-- Create function to detect unusual profile access
CREATE OR REPLACE FUNCTION public.detect_unusual_profile_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  unusual_access RECORD;
BEGIN
  -- Detect after-hours profile access
  FOR unusual_access IN
    SELECT 
      admin_user_id,
      COUNT(*) as access_count,
      MIN(created_at) as first_access,
      MAX(created_at) as last_access
    FROM admin_audit_log 
    WHERE action LIKE '%profile%'
      AND created_at > now() - interval '24 hours'
      AND (EXTRACT(HOUR FROM created_at) < 6 OR EXTRACT(HOUR FROM created_at) > 22) -- Outside business hours
    GROUP BY admin_user_id
    HAVING COUNT(*) >= 5
  LOOP
    -- Create alert for after-hours access
    PERFORM create_security_alert(
      'after_hours_profile_access',
      'medium',
      'After-Hours Profile Access Detected',
      format('Admin %s accessed customer profiles %s times outside business hours in the last 24 hours.', 
             unusual_access.admin_user_id, 
             unusual_access.access_count),
      jsonb_build_object(
        'admin_user_id', unusual_access.admin_user_id,
        'access_count', unusual_access.access_count,
        'time_window', '24_hours',
        'access_pattern', 'after_hours',
        'requires_review', true
      )
    );
  END LOOP;
END;
$$;