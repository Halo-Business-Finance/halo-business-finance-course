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

-- Enhanced Biometric Security Functions
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