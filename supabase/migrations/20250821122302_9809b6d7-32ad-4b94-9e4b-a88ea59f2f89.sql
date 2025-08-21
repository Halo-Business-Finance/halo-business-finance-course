-- Fix function search path security issue
-- Set search_path for functions that don't have it properly configured

-- Update functions to have secure search_path
CREATE OR REPLACE FUNCTION public.register_device_fingerprint(p_device_fingerprint text, p_device_info jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.analyze_user_behavior_anomaly(p_behavior_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.check_threat_indicators(p_ip_address inet, p_user_agent text DEFAULT NULL::text, p_additional_indicators jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;