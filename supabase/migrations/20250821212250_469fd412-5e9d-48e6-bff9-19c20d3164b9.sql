-- CRITICAL SECURITY REMEDIATION PHASE 1: Enhanced MFA/Biometric Security (Fixed)

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS public.validate_mfa_access(uuid);
DROP FUNCTION IF EXISTS public.validate_biometric_access(uuid);

-- Create secure validation function for MFA access
CREATE OR REPLACE FUNCTION public.validate_mfa_access(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Absolute requirement: User must be authenticated
  IF auth.uid() IS NULL THEN
    INSERT INTO public.security_events (event_type, severity, details)
    VALUES (
      'unauthenticated_mfa_access_attempt',
      'critical',
      jsonb_build_object(
        'attempted_target', target_user_id,
        'timestamp', now(),
        'threat_level', 'critical'
      )
    );
    RETURN false;
  END IF;

  -- Users can only access their own MFA data
  IF auth.uid() = target_user_id THEN
    RETURN true;
  END IF;

  -- Super admins can access MFA data with comprehensive logging
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    -- Log super admin MFA access
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      'mfa_data_administrative_access',
      target_user_id,
      'user_mfa',
      jsonb_build_object(
        'access_type', 'super_admin_mfa_access',
        'timestamp', now(),
        'security_classification', 'restricted',
        'compliance_note', 'admin_accessing_mfa_secrets'
      ),
      'restricted'
    );
    RETURN true;
  END IF;

  -- Unauthorized access attempt - create security alert
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'unauthorized_mfa_access_attempt',
    'critical',
    jsonb_build_object(
      'attempted_target_mfa', target_user_id,
      'unauthorized_user', auth.uid(),
      'timestamp', now(),
      'violation_type', 'mfa_secrets_access_denied',
      'potential_security_breach', true
    ),
    auth.uid()
  );

  RETURN false;
END;
$$;

-- Create secure validation function for biometric access
CREATE OR REPLACE FUNCTION public.validate_biometric_access(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Absolute requirement: User must be authenticated
  IF auth.uid() IS NULL THEN
    INSERT INTO public.security_events (event_type, severity, details)
    VALUES (
      'unauthenticated_biometric_access_attempt',
      'critical',
      jsonb_build_object(
        'attempted_target', target_user_id,
        'timestamp', now(),
        'threat_level', 'critical'
      )
    );
    RETURN false;
  END IF;

  -- Users can only access their own biometric data
  IF auth.uid() = target_user_id THEN
    RETURN true;
  END IF;

  -- Super admins can access biometric data with comprehensive logging
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    -- Log super admin biometric access
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      'biometric_data_administrative_access',
      target_user_id,
      'user_biometrics',
      jsonb_build_object(
        'access_type', 'super_admin_biometric_access',
        'timestamp', now(),
        'security_classification', 'restricted',
        'compliance_note', 'admin_accessing_biometric_templates'
      ),
      'restricted'
    );
    RETURN true;
  END IF;

  -- Unauthorized access attempt - create security alert
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'unauthorized_biometric_access_attempt',
    'critical',
    jsonb_build_object(
      'attempted_target_biometric', target_user_id,
      'unauthorized_user', auth.uid(),
      'timestamp', now(),
      'violation_type', 'biometric_templates_access_denied',
      'potential_security_breach', true
    ),
    auth.uid()
  );

  RETURN false;
END;
$$;