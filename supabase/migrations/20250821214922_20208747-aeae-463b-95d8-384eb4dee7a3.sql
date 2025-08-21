-- CRITICAL SECURITY REMEDIATION PHASE 2: Real-Time Threat Detection Functions

-- Enhanced profile data masking function
CREATE OR REPLACE FUNCTION public.mask_profile_data_advanced(profile_row RECORD, viewing_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_viewer_admin BOOLEAN := false;
  is_own_data BOOLEAN := false;
  masked_data jsonb;
BEGIN
  -- Check if viewer is admin
  is_viewer_admin := is_admin(viewing_user_id);
  
  -- Check if viewing own data
  is_own_data := (profile_row.user_id = viewing_user_id);

  -- Log profile data access attempt
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'profile_data_access_attempt',
    CASE 
      WHEN is_own_data THEN 'low'
      WHEN is_viewer_admin THEN 'medium'
      ELSE 'high'
    END,
    jsonb_build_object(
      'profile_owner', profile_row.user_id,
      'accessing_user', viewing_user_id,
      'is_admin_access', is_viewer_admin,
      'is_own_data', is_own_data,
      'timestamp', now()
    ),
    viewing_user_id
  );

  -- Return appropriate data based on access level
  IF is_own_data OR is_viewer_admin THEN
    -- Full access for own data or admin
    masked_data := row_to_json(profile_row)::jsonb;
    
    -- Log admin access to customer PII
    IF is_viewer_admin AND NOT is_own_data THEN
      PERFORM log_sensitive_data_access('profiles', profile_row.user_id, 'Admin profile data view');
    END IF;
  ELSE
    -- Masked data for unauthorized viewers
    masked_data := jsonb_build_object(
      'id', profile_row.id,
      'user_id', profile_row.user_id,
      'name', '***',
      'email', '***@***.***',
      'phone', '***-***-****',
      'title', profile_row.title,
      'company', profile_row.company,
      'city', profile_row.city,
      'state', profile_row.state,
      'join_date', profile_row.join_date,
      'created_at', profile_row.created_at
    );
  END IF;

  RETURN masked_data;
END;
$$;

-- Real-time threat detection function
CREATE OR REPLACE FUNCTION public.detect_real_time_threats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  threat_record RECORD;
  bulk_access_record RECORD;
BEGIN
  -- Detect rapid-fire profile access (potential data scraping)
  FOR bulk_access_record IN
    SELECT 
      user_id,
      COUNT(*) as access_count,
      MIN(created_at) as first_access,
      MAX(created_at) as last_access
    FROM security_events 
    WHERE event_type = 'profile_data_access_attempt'
      AND created_at > now() - interval '15 minutes'
      AND user_id != (details->>'profile_owner')::uuid  -- Not accessing own data
    GROUP BY user_id
    HAVING COUNT(*) >= 8  -- 8+ profile accesses in 15 minutes
  LOOP
    -- Create critical threat alert
    PERFORM create_security_alert(
      'real_time_data_scraping_detected',
      'critical',
      'URGENT: Real-Time Data Scraping Attack Detected',
      format('SECURITY BREACH: User %s accessed %s different profiles in 15 minutes. Immediate lockdown required.', 
             bulk_access_record.user_id, 
             bulk_access_record.access_count),
      jsonb_build_object(
        'threat_user_id', bulk_access_record.user_id,
        'profile_access_count', bulk_access_record.access_count,
        'time_window', '15_minutes',
        'threat_level', 'critical',
        'requires_immediate_lockdown', true,
        'potential_gdpr_violation', true,
        'automated_detection', true
      )
    );
  END LOOP;

  -- Detect MFA bypass attempts
  FOR threat_record IN
    SELECT 
      user_id,
      COUNT(*) as attempt_count
    FROM security_events 
    WHERE event_type IN ('unauthorized_mfa_access_attempt', 'unauthorized_biometric_access_attempt')
      AND created_at > now() - interval '5 minutes'
    GROUP BY user_id
    HAVING COUNT(*) >= 3
  LOOP
    -- Create security alert for MFA bypass attempts
    PERFORM create_security_alert(
      'mfa_bypass_attack_detected',
      'critical',
      'MFA Bypass Attack Detected',
      format('User %s attempted to bypass MFA/biometric security %s times in 5 minutes.', 
             threat_record.user_id, 
             threat_record.attempt_count),
      jsonb_build_object(
        'attacking_user', threat_record.user_id,
        'attempt_count', threat_record.attempt_count,
        'attack_type', 'mfa_bypass',
        'threat_level', 'critical'
      )
    );
  END LOOP;
END;
$$;

-- Enhanced security monitoring trigger
CREATE OR REPLACE FUNCTION public.enhanced_security_monitoring()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Trigger real-time threat detection for security events
  IF NEW.event_type IN (
    'profile_data_access_attempt',
    'unauthorized_mfa_access_attempt', 
    'unauthorized_biometric_access_attempt'
  ) THEN
    -- Asynchronously trigger threat detection
    PERFORM pg_notify('real_time_threats', NEW.id::text);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for enhanced monitoring
DROP TRIGGER IF EXISTS enhanced_security_monitoring_trigger ON security_events;
CREATE TRIGGER enhanced_security_monitoring_trigger
  AFTER INSERT ON security_events
  FOR EACH ROW
  EXECUTE FUNCTION enhanced_security_monitoring();

-- Log the security enhancement completion
INSERT INTO public.security_events (event_type, severity, details)
VALUES (
  'critical_security_fixes_deployed',
  'low',
  jsonb_build_object(
    'timestamp', now(),
    'fixes_applied', ARRAY[
      'enhanced_mfa_biometric_security',
      'real_time_threat_detection',
      'advanced_profile_data_masking',
      'comprehensive_audit_logging'
    ],
    'security_level', 'enhanced',
    'compliance_status', 'improved'
  )
);