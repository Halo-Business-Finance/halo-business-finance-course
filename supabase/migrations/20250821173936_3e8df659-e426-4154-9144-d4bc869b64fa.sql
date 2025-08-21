-- Security Enhancement Migration: Strengthen RLS policies and add monitoring

-- Create enhanced security monitoring function
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access_enhanced(
  p_table_name text,
  p_user_id uuid,
  p_access_type text DEFAULT 'SELECT',
  p_additional_context jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only log if admin accessing another user's data
  IF auth.uid() != p_user_id AND is_admin(auth.uid()) THEN
    -- Log to admin audit trail with enhanced context
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      format('enhanced_%s_access', lower(p_access_type)),
      p_user_id,
      p_table_name,
      jsonb_build_object(
        'access_type', p_access_type,
        'timestamp', now(),
        'table_accessed', p_table_name,
        'security_level', 'enhanced_monitoring',
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for',
        'user_agent', current_setting('request.headers', true)::json->>'user-agent'
      ) || p_additional_context,
      'confidential'
    );
    
    -- Create security event for monitoring
    INSERT INTO public.security_events (
      event_type,
      severity,
      details,
      user_id
    ) VALUES (
      'enhanced_sensitive_data_access',
      'medium',
      jsonb_build_object(
        'admin_user', auth.uid(),
        'target_user', p_user_id,
        'table_accessed', p_table_name,
        'access_type', p_access_type,
        'requires_monitoring', true
      ),
      auth.uid()
    );
  END IF;
END;
$$;

-- Create function to validate and log MFA access
CREATE OR REPLACE FUNCTION public.validate_mfa_access(p_target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Users can only access their own MFA data
  IF auth.uid() = p_target_user_id THEN
    RETURN true;
  END IF;
  
  -- Super admins can access with enhanced logging
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    -- Log super admin access to MFA data
    PERFORM log_sensitive_data_access_enhanced(
      'user_mfa',
      p_target_user_id,
      'MFA_ACCESS',
      jsonb_build_object(
        'security_classification', 'highly_confidential',
        'access_justification', 'super_admin_mfa_management'
      )
    );
    RETURN true;
  END IF;
  
  -- Log unauthorized access attempt
  INSERT INTO public.security_events (
    event_type,
    severity,
    details,
    user_id
  ) VALUES (
    'unauthorized_mfa_access_attempt',
    'critical',
    jsonb_build_object(
      'attempting_user', auth.uid(),
      'target_user', p_target_user_id,
      'timestamp', now(),
      'threat_level', 'high'
    ),
    auth.uid()
  );
  
  RETURN false;
END;
$$;

-- Create function to validate biometric access
CREATE OR REPLACE FUNCTION public.validate_biometric_access(p_target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Users can only access their own biometric data
  IF auth.uid() = p_target_user_id THEN
    RETURN true;
  END IF;
  
  -- Super admins can access with enhanced logging
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    -- Log super admin access to biometric data
    PERFORM log_sensitive_data_access_enhanced(
      'user_biometrics',
      p_target_user_id,
      'BIOMETRIC_ACCESS',
      jsonb_build_object(
        'security_classification', 'highly_confidential',
        'access_justification', 'super_admin_biometric_management'
      )
    );
    RETURN true;
  END IF;
  
  -- Log unauthorized access attempt
  INSERT INTO public.security_events (
    event_type,
    severity,
    details,
    user_id
  ) VALUES (
    'unauthorized_biometric_access_attempt',
    'critical',
    jsonb_build_object(
      'attempting_user', auth.uid(),
      'target_user', p_target_user_id,
      'timestamp', now(),
      'threat_level', 'high'
    ),
    auth.uid()
  );
  
  RETURN false;
END;
$$;

-- Update user_mfa RLS policies with enhanced security
DROP POLICY IF EXISTS "Users can manage their own MFA" ON public.user_mfa;
DROP POLICY IF EXISTS "Admins can view MFA status" ON public.user_mfa;

CREATE POLICY "Enhanced users can manage own MFA"
ON public.user_mfa
FOR ALL
USING (validate_mfa_access(user_id))
WITH CHECK (validate_mfa_access(user_id));

-- Update user_biometrics RLS policies with enhanced security  
DROP POLICY IF EXISTS "Users can manage their own biometrics" ON public.user_biometrics;
DROP POLICY IF EXISTS "Admins can view biometric status" ON public.user_biometrics;

CREATE POLICY "Enhanced users can manage own biometrics"
ON public.user_biometrics
FOR ALL
USING (validate_biometric_access(user_id))
WITH CHECK (validate_biometric_access(user_id));

-- Create security alert for suspicious role access patterns
CREATE OR REPLACE FUNCTION public.monitor_role_access_patterns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  suspicious_access RECORD;
BEGIN
  -- Check for unusual role checking patterns (potential privilege escalation attempts)
  FOR suspicious_access IN
    SELECT 
      details->>'requesting_user' as user_id,
      COUNT(*) as check_count,
      MAX(created_at) as last_check
    FROM security_events 
    WHERE event_type = 'role_check_attempt'
      AND created_at > now() - interval '15 minutes'
    GROUP BY details->>'requesting_user'
    HAVING COUNT(*) >= 20  -- 20+ role checks in 15 minutes
  LOOP
    -- Create alert for suspicious role checking
    PERFORM create_security_alert(
      'suspicious_role_access_pattern',
      'high',
      'Suspicious Role Access Pattern Detected',
      format('User %s performed %s role checks in 15 minutes. Potential privilege escalation attempt.', 
             suspicious_access.user_id, 
             suspicious_access.check_count),
      jsonb_build_object(
        'user_id', suspicious_access.user_id,
        'check_count', suspicious_access.check_count,
        'time_window', '15_minutes',
        'alert_type', 'privilege_escalation_attempt',
        'requires_investigation', true
      )
    );
  END LOOP;
END;
$$;