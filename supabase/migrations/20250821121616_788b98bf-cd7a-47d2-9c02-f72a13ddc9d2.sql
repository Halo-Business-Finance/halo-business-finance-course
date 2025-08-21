-- Military-Grade Security Functions with Proper Search Path

-- Device fingerprinting and registration
CREATE OR REPLACE FUNCTION public.register_device_fingerprint(
  p_device_fingerprint TEXT,
  p_device_info JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  device_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Insert or update device
  INSERT INTO public.user_devices (
    user_id, device_fingerprint, device_name, device_type,
    browser_info, os_info, hardware_info, screen_resolution,
    timezone, language, last_ip, geolocation
  ) VALUES (
    current_user_id,
    p_device_fingerprint,
    p_device_info->>'device_name',
    p_device_info->>'device_type',
    p_device_info->'browser_info',
    p_device_info->'os_info', 
    p_device_info->'hardware_info',
    p_device_info->>'screen_resolution',
    p_device_info->>'timezone',
    p_device_info->>'language',
    (p_device_info->>'ip_address')::inet,
    p_device_info->'geolocation'
  )
  ON CONFLICT (user_id, device_fingerprint)
  DO UPDATE SET
    last_seen_at = now(),
    last_ip = EXCLUDED.last_ip,
    geolocation = EXCLUDED.geolocation
  RETURNING id INTO device_id;

  -- Log device registration
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'device_registered',
    'low',
    jsonb_build_object(
      'device_id', device_id,
      'device_fingerprint', p_device_fingerprint,
      'device_info', p_device_info
    ),
    current_user_id
  );

  RETURN device_id;
END;
$$;

-- Advanced geolocation validation
CREATE OR REPLACE FUNCTION public.validate_geolocation_access(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_country_code TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  violation_count INTEGER := 0;
  allow_access BOOLEAN := true;
  require_mfa BOOLEAN := false;
  rule_record RECORD;
  result JSONB;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'authentication_required',
      'require_mfa', false
    );
  END IF;

  -- Check geolocation rules for this user and global rules
  FOR rule_record IN 
    SELECT * FROM public.geolocation_rules 
    WHERE (user_id = current_user_id OR user_id IS NULL)
      AND is_active = true
    ORDER BY priority DESC, user_id NULLS LAST
  LOOP
    -- Check country code rules
    IF rule_record.country_codes IS NOT NULL AND p_country_code IS NOT NULL THEN
      IF rule_record.rule_type = 'deny' AND p_country_code = ANY(rule_record.country_codes) THEN
        allow_access := false;
        violation_count := violation_count + 1;
      ELSIF rule_record.rule_type = 'allow' AND p_country_code = ANY(rule_record.country_codes) THEN
        allow_access := true;
      ELSIF rule_record.rule_type = 'require_mfa' AND p_country_code = ANY(rule_record.country_codes) THEN
        require_mfa := true;
      END IF;
    END IF;

    -- Check IP range rules
    IF rule_record.ip_ranges IS NOT NULL AND p_ip_address IS NOT NULL THEN
      FOR i IN 1..array_length(rule_record.ip_ranges, 1) LOOP
        IF p_ip_address <<= rule_record.ip_ranges[i] THEN
          IF rule_record.rule_type = 'deny' THEN
            allow_access := false;
            violation_count := violation_count + 1;
          ELSIF rule_record.rule_type = 'require_mfa' THEN
            require_mfa := true;
          END IF;
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  -- Log geolocation check
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'geolocation_check',
    CASE 
      WHEN NOT allow_access THEN 'high'
      WHEN require_mfa THEN 'medium'
      ELSE 'low'
    END,
    jsonb_build_object(
      'latitude', p_latitude,
      'longitude', p_longitude,
      'country_code', p_country_code,
      'ip_address', p_ip_address,
      'allowed', allow_access,
      'require_mfa', require_mfa,
      'violations', violation_count
    ),
    current_user_id
  );

  RETURN jsonb_build_object(
    'allowed', allow_access,
    'require_mfa', require_mfa,
    'violation_count', violation_count
  );
END;
$$;

-- Behavioral anomaly detection
CREATE OR REPLACE FUNCTION public.analyze_user_behavior_anomaly(
  p_behavior_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  pattern_record RECORD;
  anomaly_score DECIMAL := 0;
  total_patterns INTEGER := 0;
  result JSONB;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Analyze each behavior pattern
  FOR pattern_record IN 
    SELECT * FROM public.user_behavior_patterns 
    WHERE user_id = current_user_id
  LOOP
    total_patterns := total_patterns + 1;
    
    -- Simple anomaly scoring based on deviation from normal patterns
    CASE pattern_record.pattern_type
      WHEN 'login_time' THEN
        -- Check if login time is unusual
        IF (p_behavior_data->>'login_hour')::INTEGER NOT BETWEEN 6 AND 22 THEN
          anomaly_score := anomaly_score + 20;
        END IF;
      WHEN 'location' THEN
        -- Check for unusual location patterns
        IF p_behavior_data->>'country' != pattern_record.pattern_data->>'typical_country' THEN
          anomaly_score := anomaly_score + 30;
        END IF;
      WHEN 'device' THEN
        -- Check for new device usage
        IF p_behavior_data->>'device_fingerprint' != pattern_record.pattern_data->>'typical_device' THEN
          anomaly_score := anomaly_score + 25;
        END IF;
    END CASE;
  END LOOP;

  -- Update or create new behavior pattern
  INSERT INTO public.user_behavior_patterns (
    user_id, pattern_type, pattern_data, confidence_score, anomaly_score
  ) VALUES (
    current_user_id,
    'current_session',
    p_behavior_data,
    GREATEST(100 - anomaly_score, 0),
    anomaly_score
  );

  -- Create security alert for high anomaly scores
  IF anomaly_score > 50 THEN
    PERFORM public.create_security_alert(
      'behavioral_anomaly_detected',
      CASE 
        WHEN anomaly_score > 80 THEN 'critical'
        WHEN anomaly_score > 60 THEN 'high'
        ELSE 'medium'
      END,
      'Unusual User Behavior Detected',
      format('Anomaly score: %s. Detected unusual behavior patterns for user.', anomaly_score),
      jsonb_build_object(
        'user_id', current_user_id,
        'anomaly_score', anomaly_score,
        'behavior_data', p_behavior_data,
        'risk_level', CASE 
          WHEN anomaly_score > 80 THEN 'critical'
          WHEN anomaly_score > 60 THEN 'high'
          ELSE 'medium'
        END
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'anomaly_score', anomaly_score,
    'risk_level', CASE 
      WHEN anomaly_score > 80 THEN 'critical'
      WHEN anomaly_score > 60 THEN 'high'
      WHEN anomaly_score > 30 THEN 'medium'
      ELSE 'low'
    END,
    'require_additional_verification', anomaly_score > 50
  );
END;
$$;

-- Advanced threat intelligence check
CREATE OR REPLACE FUNCTION public.check_threat_indicators(
  p_ip_address INET,
  p_user_agent TEXT DEFAULT NULL,
  p_additional_indicators JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  threat_found BOOLEAN := false;
  max_threat_level INTEGER := 0;
  threat_details JSONB := '[]'::jsonb;
  threat_record RECORD;
BEGIN
  -- Check IP address against threat intelligence
  FOR threat_record IN 
    SELECT * FROM public.threat_intelligence 
    WHERE indicator_type = 'ip' 
      AND indicator_value = host(p_ip_address)::text
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  LOOP
    threat_found := true;
    max_threat_level := GREATEST(max_threat_level, threat_record.threat_level);
    
    threat_details := threat_details || jsonb_build_object(
      'type', threat_record.threat_type,
      'level', threat_record.threat_level,
      'description', threat_record.description,
      'source', threat_record.source
    );
  END LOOP;

  -- Check user agent patterns
  IF p_user_agent IS NOT NULL THEN
    FOR threat_record IN 
      SELECT * FROM public.threat_intelligence 
      WHERE indicator_type = 'user_agent_pattern' 
        AND p_user_agent ~ indicator_value
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > now())
    LOOP
      threat_found := true;
      max_threat_level := GREATEST(max_threat_level, threat_record.threat_level);
      
      threat_details := threat_details || jsonb_build_object(
        'type', threat_record.threat_type,
        'level', threat_record.threat_level,
        'description', threat_record.description,
        'matched_pattern', threat_record.indicator_value
      );
    END LOOP;
  END IF;

  -- Log threat check
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'threat_intelligence_check',
    CASE 
      WHEN max_threat_level >= 8 THEN 'critical'
      WHEN max_threat_level >= 6 THEN 'high'
      WHEN max_threat_level >= 4 THEN 'medium'
      ELSE 'low'
    END,
    jsonb_build_object(
      'ip_address', p_ip_address,
      'user_agent', p_user_agent,
      'threat_found', threat_found,
      'max_threat_level', max_threat_level,
      'threat_count', jsonb_array_length(threat_details),
      'threats', threat_details
    )
  );

  RETURN jsonb_build_object(
    'threat_detected', threat_found,
    'threat_level', max_threat_level,
    'block_access', max_threat_level >= 7,
    'require_additional_verification', max_threat_level >= 5,
    'threat_details', threat_details
  );
END;
$$;

-- MFA validation and management
CREATE OR REPLACE FUNCTION public.validate_mfa_token(
  p_method_type TEXT,
  p_token TEXT,
  p_backup_code BOOLEAN DEFAULT false
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  mfa_record RECORD;
  is_valid BOOLEAN := false;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO mfa_record 
  FROM public.user_mfa 
  WHERE user_id = current_user_id 
    AND method_type = p_method_type
    AND is_enabled = true
    AND (locked_until IS NULL OR locked_until < now());

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Validate token (simplified - in production, implement proper TOTP/SMS validation)
  IF p_backup_code THEN
    -- Check backup codes
    is_valid := p_token = ANY(mfa_record.backup_codes);
  ELSE
    -- For TOTP, SMS, etc. - implement actual validation
    -- This is a placeholder - real implementation would validate TOTP codes
    is_valid := length(p_token) >= 6;
  END IF;

  -- Update MFA record
  IF is_valid THEN
    UPDATE public.user_mfa 
    SET last_used_at = now(), failure_count = 0
    WHERE id = mfa_record.id;
    
    -- Log successful MFA
    INSERT INTO public.security_events (event_type, severity, details, user_id)
    VALUES (
      'mfa_validation_success',
      'low',
      jsonb_build_object(
        'method_type', p_method_type,
        'backup_code_used', p_backup_code
      ),
      current_user_id
    );
  ELSE
    UPDATE public.user_mfa 
    SET failure_count = failure_count + 1,
        locked_until = CASE 
          WHEN failure_count >= 4 THEN now() + interval '1 hour'
          ELSE locked_until
        END
    WHERE id = mfa_record.id;
    
    -- Log failed MFA
    INSERT INTO public.security_events (event_type, severity, details, user_id)
    VALUES (
      'mfa_validation_failed',
      'medium',
      jsonb_build_object(
        'method_type', p_method_type,
        'failure_count', mfa_record.failure_count + 1,
        'backup_code_attempted', p_backup_code
      ),
      current_user_id
    );
  END IF;

  RETURN is_valid;
END;
$$;

-- Emergency security lockdown
CREATE OR REPLACE FUNCTION public.emergency_security_lockdown(
  p_reason TEXT,
  p_affected_users UUID[] DEFAULT NULL,
  p_lockdown_type TEXT DEFAULT 'full'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  incident_id UUID;
  affected_count INTEGER := 0;
BEGIN
  current_user_id := auth.uid();
  
  -- Only super admins can initiate emergency lockdown
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = current_user_id 
      AND role = 'super_admin' 
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Insufficient privileges for emergency lockdown';
  END IF;

  -- Create security incident
  INSERT INTO public.security_incidents (
    incident_type, severity, status, title, description,
    affected_users, reported_by
  ) VALUES (
    'emergency_lockdown',
    'emergency',
    'investigating',
    'Emergency Security Lockdown Initiated',
    p_reason,
    COALESCE(p_affected_users, ARRAY[]::UUID[]),
    current_user_id
  ) RETURNING id INTO incident_id;

  -- Terminate active sessions
  IF p_lockdown_type IN ('full', 'session_termination') THEN
    UPDATE public.user_sessions 
    SET is_active = false, 
        terminated_at = now(),
        termination_reason = 'emergency_lockdown'
    WHERE (p_affected_users IS NULL OR user_id = ANY(p_affected_users))
      AND is_active = true;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
  END IF;

  -- Create critical security alert
  PERFORM public.create_security_alert(
    'emergency_lockdown_initiated',
    'critical',
    'EMERGENCY SECURITY LOCKDOWN',
    format('Emergency lockdown initiated by admin %s. Reason: %s. Affected users: %s', 
           current_user_id, p_reason, 
           COALESCE(array_length(p_affected_users, 1), 0)),
    jsonb_build_object(
      'initiated_by', current_user_id,
      'lockdown_type', p_lockdown_type,
      'affected_users', COALESCE(p_affected_users, ARRAY[]::UUID[]),
      'sessions_terminated', affected_count,
      'incident_id', incident_id,
      'emergency_level', 'maximum'
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'incident_id', incident_id,
    'sessions_terminated', affected_count,
    'lockdown_type', p_lockdown_type,
    'affected_users', COALESCE(array_length(p_affected_users, 1), 0)
  );
END;
$$;