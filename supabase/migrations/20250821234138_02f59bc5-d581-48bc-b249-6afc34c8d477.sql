-- CRITICAL SECURITY FIXES - Phase 2: Enhanced Security Hardening and Compliance

-- 1. Create secure production environment check function
CREATE OR REPLACE FUNCTION public.is_production_environment()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(current_setting('app.environment', true) = 'production', false);
$function$;

-- 2. Create comprehensive security audit trail function
CREATE OR REPLACE FUNCTION public.create_comprehensive_audit_entry(
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_before_state jsonb DEFAULT NULL,
  p_after_state jsonb DEFAULT NULL,
  p_classification data_classification DEFAULT 'confidential'
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  audit_id uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Ensure user is authenticated for audit actions
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required for audit actions';
  END IF;

  -- Create comprehensive audit entry
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    target_resource,
    details,
    data_classification
  ) VALUES (
    current_user_id,
    p_action,
    CASE WHEN p_resource_type = 'user' THEN p_resource_id::uuid ELSE NULL END,
    p_resource_type,
    jsonb_build_object(
      'resource_id', p_resource_id,
      'before_state', p_before_state,
      'after_state', p_after_state,
      'audit_timestamp', now(),
      'user_agent', current_setting('request.headers', true)::json->>'user-agent',
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for',
      'session_info', current_setting('request.jwt.claims', true)::json,
      'classification', p_classification
    ),
    p_classification
  ) RETURNING id INTO audit_id;

  -- Create security event for high-privilege actions
  IF p_classification IN ('restricted', 'confidential') THEN
    INSERT INTO public.security_events (event_type, severity, details, user_id)
    VALUES (
      'high_privilege_audit_action',
      'medium',
      jsonb_build_object(
        'audit_id', audit_id,
        'action', p_action,
        'resource_type', p_resource_type,
        'classification', p_classification,
        'requires_monitoring', true
      ),
      current_user_id
    );
  END IF;

  RETURN audit_id;
END;
$function$;

-- 3. Enhanced data classification enforcement
CREATE OR REPLACE FUNCTION public.enforce_data_classification_access(
  p_requested_classification data_classification,
  p_resource_context jsonb DEFAULT '{}'
)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
  user_clearance_level integer := 0;
  required_clearance_level integer;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Determine required clearance level based on classification
  CASE p_requested_classification
    WHEN 'public' THEN required_clearance_level := 1;
    WHEN 'internal' THEN required_clearance_level := 2;
    WHEN 'confidential' THEN required_clearance_level := 3;
    WHEN 'restricted' THEN required_clearance_level := 4;
    ELSE required_clearance_level := 5; -- Unknown = highest security
  END CASE;

  -- Determine user clearance level based on roles
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = current_user_id 
        AND role = 'super_admin' 
        AND is_active = true
      ) THEN 4
      WHEN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = current_user_id 
        AND role = 'admin' 
        AND is_active = true
      ) THEN 3
      WHEN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = current_user_id 
        AND role = 'tech_support_admin' 
        AND is_active = true
      ) THEN 2
      ELSE 1
    END
  INTO user_clearance_level;

  -- Log access attempt
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'data_classification_access_check',
    CASE 
      WHEN user_clearance_level >= required_clearance_level THEN 'low'
      ELSE 'high'
    END,
    jsonb_build_object(
      'requested_classification', p_requested_classification,
      'user_clearance_level', user_clearance_level,
      'required_clearance_level', required_clearance_level,
      'access_granted', user_clearance_level >= required_clearance_level,
      'resource_context', p_resource_context
    ),
    current_user_id
  );

  RETURN user_clearance_level >= required_clearance_level;
END;
$function$;

-- 4. Create secure session validation function
CREATE OR REPLACE FUNCTION public.validate_secure_session(p_require_mfa boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
  session_valid boolean := false;
  session_details jsonb;
  mfa_verified boolean := false;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'no_authentication',
      'requires_login', true
    );
  END IF;

  -- Check if user has valid active sessions
  SELECT COUNT(*) > 0 INTO session_valid
  FROM public.user_sessions
  WHERE user_id = current_user_id
    AND is_active = true
    AND expires_at > now()
    AND (terminated_at IS NULL OR terminated_at > now());

  -- Check MFA status if required
  IF p_require_mfa THEN
    SELECT COUNT(*) > 0 INTO mfa_verified
    FROM public.user_mfa
    WHERE user_id = current_user_id
      AND is_enabled = true
      AND last_used_at > (now() - interval '24 hours');
  ELSE
    mfa_verified := true; -- MFA not required
  END IF;

  session_details := jsonb_build_object(
    'valid', session_valid AND mfa_verified,
    'session_active', session_valid,
    'mfa_verified', mfa_verified,
    'mfa_required', p_require_mfa,
    'user_id', current_user_id,
    'validation_timestamp', now()
  );

  -- Log session validation for security monitoring
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'secure_session_validation',
    CASE 
      WHEN session_valid AND mfa_verified THEN 'low'
      ELSE 'medium'
    END,
    session_details,
    current_user_id
  );

  RETURN session_details;
END;
$function$;

-- 5. Create automated security compliance check function
CREATE OR REPLACE FUNCTION public.run_security_compliance_check()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  compliance_result jsonb;
  rls_tables integer := 0;
  unprotected_tables integer := 0;
  admin_without_mfa integer := 0;
  stale_sessions integer := 0;
  compliance_score numeric;
BEGIN
  -- Check RLS coverage
  SELECT COUNT(*) INTO rls_tables
  FROM pg_tables t
  WHERE t.schemaname = 'public'
    AND EXISTS (
      SELECT 1 FROM pg_policies p 
      WHERE p.schemaname = t.schemaname 
      AND p.tablename = t.tablename
    );

  SELECT COUNT(*) INTO unprotected_tables
  FROM pg_tables t
  WHERE t.schemaname = 'public'
    AND NOT EXISTS (
      SELECT 1 FROM pg_policies p 
      WHERE p.schemaname = t.schemaname 
      AND p.tablename = t.tablename
    );

  -- Check admin MFA compliance
  SELECT COUNT(*) INTO admin_without_mfa
  FROM public.user_roles ur
  WHERE ur.role IN ('admin', 'super_admin', 'tech_support_admin')
    AND ur.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.user_mfa mfa
      WHERE mfa.user_id = ur.user_id
      AND mfa.is_enabled = true
    );

  -- Check for stale sessions
  SELECT COUNT(*) INTO stale_sessions
  FROM public.user_sessions
  WHERE is_active = true
    AND last_activity_at < (now() - interval '7 days');

  -- Calculate compliance score (0-100)
  compliance_score := 100 * (
    (CASE WHEN unprotected_tables = 0 THEN 30 ELSE 0 END) +
    (CASE WHEN admin_without_mfa = 0 THEN 25 ELSE 0 END) +
    (CASE WHEN stale_sessions = 0 THEN 25 ELSE 0 END) +
    20 -- Base security implementation score
  ) / 100.0;

  compliance_result := jsonb_build_object(
    'compliance_score', compliance_score,
    'status', CASE 
      WHEN compliance_score >= 95 THEN 'excellent'
      WHEN compliance_score >= 80 THEN 'good'
      WHEN compliance_score >= 60 THEN 'acceptable'
      ELSE 'critical'
    END,
    'rls_protected_tables', rls_tables,
    'unprotected_tables', unprotected_tables,
    'admin_without_mfa', admin_without_mfa,
    'stale_sessions', stale_sessions,
    'check_timestamp', now(),
    'recommendations', CASE
      WHEN unprotected_tables > 0 THEN jsonb_build_array('Enable RLS on all public tables')
      ELSE jsonb_build_array()
    END ||
    CASE
      WHEN admin_without_mfa > 0 THEN jsonb_build_array('Enforce MFA for all admin accounts')
      ELSE jsonb_build_array()
    END ||
    CASE
      WHEN stale_sessions > 0 THEN jsonb_build_array('Clean up stale user sessions')
      ELSE jsonb_build_array()
    END
  );

  -- Log compliance check
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'security_compliance_check_completed',
    CASE 
      WHEN compliance_score >= 80 THEN 'low'
      WHEN compliance_score >= 60 THEN 'medium'
      ELSE 'high'
    END,
    compliance_result
  );

  -- Create alert if compliance is poor
  IF compliance_score < 60 THEN
    PERFORM create_security_alert(
      'security_compliance_failure',
      'high',
      'Security Compliance Check Failed',
      format('Security compliance score: %s%%. Immediate remediation required.', compliance_score),
      compliance_result
    );
  END IF;

  RETURN compliance_result;
END;
$function$;

-- 6. Create enhanced profile access with mandatory rate limiting
CREATE OR REPLACE FUNCTION public.secure_profile_access_with_rate_limit(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rate_limit_result jsonb;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Mandatory authentication check
  IF current_user_id IS NULL THEN
    INSERT INTO public.security_events (event_type, severity, details)
    VALUES (
      'unauthenticated_profile_access_blocked',
      'critical',
      jsonb_build_object(
        'attempted_target', target_user_id,
        'timestamp', now(),
        'threat_level', 'critical'
      )
    );
    RETURN false;
  END IF;

  -- Users can access their own data without rate limiting
  IF current_user_id = target_user_id THEN
    RETURN true;
  END IF;

  -- Check rate limit for admin access
  SELECT check_profile_access_rate_limit(target_user_id) INTO rate_limit_result;
  
  IF NOT (rate_limit_result->>'allowed')::boolean THEN
    RETURN false;
  END IF;

  -- Call existing secure profile access function
  RETURN secure_profile_access(target_user_id);
END;
$function$;

-- 7. Update profile RLS policy to use enhanced rate-limited access
DROP POLICY IF EXISTS "Enhanced secure customer profile access" ON public.profiles;
CREATE POLICY "Enhanced secure customer profile access with rate limiting" 
ON public.profiles 
FOR SELECT
USING (secure_profile_access_with_rate_limit(user_id));

-- 8. Create automated security maintenance function
CREATE OR REPLACE FUNCTION public.run_automated_security_maintenance()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  maintenance_result jsonb;
  cleaned_sessions integer := 0;
  expired_tokens integer := 0;
  old_events integer := 0;
BEGIN
  -- Clean up expired sessions
  UPDATE public.user_sessions
  SET is_active = false,
      terminated_at = now(),
      termination_reason = 'automated_cleanup_expired'
  WHERE is_active = true
    AND expires_at < now();
  
  GET DIAGNOSTICS cleaned_sessions = ROW_COUNT;

  -- Clean up old security events (keep 90 days)
  DELETE FROM public.security_events
  WHERE created_at < (now() - interval '90 days')
    AND severity = 'low';
  
  GET DIAGNOSTICS old_events = ROW_COUNT;

  -- Deactivate failed biometric attempts (after 30 days)
  UPDATE public.user_biometrics
  SET is_active = false
  WHERE failure_count >= 5
    AND last_used_at < (now() - interval '30 days');

  maintenance_result := jsonb_build_object(
    'cleaned_sessions', cleaned_sessions,
    'removed_old_events', old_events,
    'maintenance_timestamp', now(),
    'status', 'completed'
  );

  -- Log maintenance completion
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'automated_security_maintenance_completed',
    'low',
    maintenance_result
  );

  RETURN maintenance_result;
END;
$function$;