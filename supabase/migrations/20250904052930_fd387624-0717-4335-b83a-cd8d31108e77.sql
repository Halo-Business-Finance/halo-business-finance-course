-- Priority 1: Enhanced Customer Data Protection

-- Create function to mask sensitive PII data based on user role
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  data_text text,
  data_type text,
  user_role text DEFAULT 'user'
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Super admins see everything
  IF user_role = 'super_admin' THEN
    RETURN data_text;
  END IF;
  
  -- Admins see partial data
  IF user_role = 'admin' THEN
    CASE data_type
      WHEN 'email' THEN
        RETURN CASE 
          WHEN data_text IS NULL THEN NULL
          WHEN length(data_text) <= 3 THEN '***@***.***'
          ELSE substring(data_text from 1 for 3) || '***@' || split_part(data_text, '@', 2)
        END;
      WHEN 'phone' THEN
        RETURN CASE 
          WHEN data_text IS NULL THEN NULL
          WHEN length(data_text) <= 4 THEN 'XXX-XXX-XXXX'
          ELSE 'XXX-XXX-' || right(data_text, 4)
        END;
      WHEN 'name' THEN
        RETURN CASE 
          WHEN data_text IS NULL THEN NULL
          WHEN length(data_text) <= 2 THEN 'XX'
          ELSE left(data_text, 2) || repeat('X', length(data_text) - 2)
        END;
      ELSE
        RETURN '*** PROTECTED ***';
    END CASE;
  END IF;
  
  -- Regular users cannot see other users' data
  RETURN '*** RESTRICTED ***';
END;
$$;

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

-- Function for detailed audit logging of admin profile access
CREATE OR REPLACE FUNCTION public.log_admin_profile_access_detailed(
  target_user_id uuid,
  access_reason text DEFAULT 'Administrative review',
  data_fields text[] DEFAULT ARRAY['basic_info']
) RETURNS void
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

  -- Create comprehensive audit trail
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'detailed_customer_profile_access',
    target_user_id,
    'individual_customer_profile',
    jsonb_build_object(
      'access_reason', access_reason,
      'data_fields_accessed', data_fields,
      'admin_role', current_user_role,
      'timestamp', now(),
      'session_info', jsonb_build_object(
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for',
        'user_agent', current_setting('request.headers', true)::json->>'user-agent'
      ),
      'compliance_flags', jsonb_build_object(
        'gdpr_applicable', true,
        'data_minimization_principle', true,
        'legitimate_interest_basis', access_reason
      )
    ),
    'confidential'
  );

  -- Create security event for monitoring
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details,
    logged_via_secure_function
  ) VALUES (
    auth.uid(),
    'admin_customer_data_access',
    'medium',
    jsonb_build_object(
      'target_customer', target_user_id,
      'access_reason', access_reason,
      'data_fields', data_fields,
      'requires_monitoring', true
    ),
    true
  );
END;
$$;

-- Priority 2: Enhanced Biometric Security

-- Function to validate and log biometric data access
CREATE OR REPLACE FUNCTION public.secure_biometric_access_log(
  target_user_id uuid,
  access_type text,
  biometric_operation text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log every biometric access attempt
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'biometric_data_access',
    target_user_id,
    'user_biometrics',
    jsonb_build_object(
      'access_type', access_type,
      'biometric_operation', biometric_operation,
      'timestamp', now(),
      'security_level', 'maximum',
      'compliance_note', 'biometric_template_access'
    ),
    'restricted'
  );

  -- Create critical security alert for biometric access
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details,
    logged_via_secure_function
  ) VALUES (
    auth.uid(),
    'biometric_access_critical',
    'high',
    jsonb_build_object(
      'target_user', target_user_id,
      'biometric_operation', biometric_operation,
      'requires_immediate_audit', true,
      'privacy_impact', 'high'
    ),
    true
  );

  RETURN true;
END;
$$;

-- Priority 3: Enhanced Security Monitoring Functions

-- Function to monitor profile access patterns
CREATE OR REPLACE FUNCTION public.monitor_profile_access_patterns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  suspicious_admin RECORD;
BEGIN
  -- Monitor for excessive profile access by admins
  FOR suspicious_admin IN
    SELECT 
      admin_user_id,
      COUNT(DISTINCT target_user_id) as unique_customers_accessed,
      COUNT(*) as total_accesses,
      MIN(created_at) as first_access,
      MAX(created_at) as last_access
    FROM public.admin_audit_log 
    WHERE action LIKE '%customer%'
      AND created_at > now() - interval '2 hours'
    GROUP BY admin_user_id
    HAVING COUNT(DISTINCT target_user_id) >= 10  -- Flag if accessing 10+ customers in 2 hours
  LOOP
    -- Create security alert
    PERFORM create_security_alert(
      'excessive_customer_data_access',
      'high',
      'Excessive Customer Data Access Pattern Detected',
      format('Admin %s accessed %s unique customer profiles in 2 hours (%s total operations)', 
             suspicious_admin.admin_user_id, 
             suspicious_admin.unique_customers_accessed,
             suspicious_admin.total_accesses),
      jsonb_build_object(
        'admin_user_id', suspicious_admin.admin_user_id,
        'customers_accessed', suspicious_admin.unique_customers_accessed,
        'total_operations', suspicious_admin.total_accesses,
        'time_span_hours', 2,
        'requires_investigation', true,
        'potential_data_mining', true
      )
    );
  END LOOP;
END;
$$;

-- Function to detect unusual access patterns
CREATE OR REPLACE FUNCTION public.detect_unusual_profile_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  unusual_pattern RECORD;
BEGIN
  -- Detect after-hours customer data access
  FOR unusual_pattern IN
    SELECT 
      admin_user_id,
      COUNT(*) as after_hours_accesses,
      array_agg(DISTINCT target_user_id) as affected_customers
    FROM public.admin_audit_log 
    WHERE action LIKE '%customer%'
      AND created_at > now() - interval '24 hours'
      AND (
        EXTRACT(hour FROM created_at) < 6 OR 
        EXTRACT(hour FROM created_at) > 22 OR
        EXTRACT(dow FROM created_at) IN (0, 6)  -- Weekend
      )
    GROUP BY admin_user_id
    HAVING COUNT(*) >= 3
  LOOP
    -- Create security alert for after-hours access
    PERFORM create_security_alert(
      'after_hours_customer_access',
      'medium',
      'After-Hours Customer Data Access Detected',
      format('Admin %s accessed customer data %s times during after-hours in last 24h', 
             unusual_pattern.admin_user_id, 
             unusual_pattern.after_hours_accesses),
      jsonb_build_object(
        'admin_user_id', unusual_pattern.admin_user_id,
        'after_hours_count', unusual_pattern.after_hours_accesses,
        'affected_customers', unusual_pattern.affected_customers,
        'requires_justification', true
      )
    );
  END LOOP;
END;
$$;

-- Comprehensive security analysis function
CREATE OR REPLACE FUNCTION public.run_comprehensive_security_analysis()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Run all monitoring functions
  PERFORM monitor_profile_access_patterns();
  PERFORM detect_unusual_profile_access();
  PERFORM detect_potential_data_breach();
  
  -- Log completion
  INSERT INTO public.security_events (event_type, severity, details, logged_via_secure_function)
  VALUES (
    'comprehensive_security_analysis_completed',
    'low',
    jsonb_build_object(
      'timestamp', now(),
      'analysis_modules', ARRAY[
        'profile_access_patterns',
        'unusual_access_detection',
        'data_breach_detection'
      ],
      'status', 'completed'
    ),
    true
  );
END;
$$;