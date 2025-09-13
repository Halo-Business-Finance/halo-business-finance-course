-- Add geographic location tracking table
CREATE TABLE public.login_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ip_address INET NOT NULL,
  country TEXT,
  region TEXT,
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone TEXT,
  isp TEXT,
  is_vpn BOOLEAN DEFAULT false,
  is_known_location BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add anomaly detection patterns table
CREATE TABLE public.access_anomalies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  pattern_data JSONB NOT NULL DEFAULT '{}',
  detection_method TEXT NOT NULL,
  confidence_score INTEGER NOT NULL DEFAULT 0,
  location_data JSONB,
  device_data JSONB,
  behavioral_data JSONB,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add user behavior baseline table
CREATE TABLE public.user_behavior_baselines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  typical_login_hours JSONB NOT NULL DEFAULT '[]',
  typical_locations JSONB NOT NULL DEFAULT '[]',
  typical_devices JSONB NOT NULL DEFAULT '[]',
  average_session_duration INTEGER DEFAULT 0,
  typical_access_patterns JSONB NOT NULL DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.login_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_baselines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own location data" 
ON public.login_locations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all location data" 
ON public.login_locations 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'super_admin' 
  AND is_active = true
));

CREATE POLICY "Users can view their own anomalies" 
ON public.access_anomalies 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage anomalies" 
ON public.access_anomalies 
FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own behavior baseline" 
ON public.user_behavior_baselines 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage behavior baselines" 
ON public.user_behavior_baselines 
FOR ALL
USING (current_setting('request.jwt.role', true) = 'service_role');

-- Function to detect login anomalies
CREATE OR REPLACE FUNCTION public.detect_login_anomaly(
  p_user_id UUID,
  p_ip_address INET,
  p_location_data JSONB,
  p_device_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  baseline RECORD;
  anomaly_score INTEGER := 0;
  anomalies JSONB := '[]'::jsonb;
  current_hour INTEGER;
  location_known BOOLEAN := false;
  device_known BOOLEAN := false;
BEGIN
  -- Get user baseline
  SELECT * INTO baseline 
  FROM user_behavior_baselines 
  WHERE user_id = p_user_id;
  
  IF baseline IS NULL THEN
    -- Create initial baseline
    INSERT INTO user_behavior_baselines (
      user_id, 
      typical_login_hours,
      typical_locations,
      typical_devices
    ) VALUES (
      p_user_id,
      jsonb_build_array(EXTRACT(HOUR FROM now())),
      jsonb_build_array(p_location_data),
      jsonb_build_array(p_device_data)
    );
    
    RETURN jsonb_build_object(
      'is_anomaly', false,
      'anomaly_score', 0,
      'message', 'Baseline created for new user'
    );
  END IF;
  
  current_hour := EXTRACT(HOUR FROM now());
  
  -- Check time anomaly
  IF NOT (baseline.typical_login_hours ? current_hour::text) THEN
    anomaly_score := anomaly_score + 30;
    anomalies := anomalies || jsonb_build_object(
      'type', 'unusual_time',
      'details', format('Login at %s:00 is unusual for this user', current_hour)
    );
  END IF;
  
  -- Check location anomaly
  SELECT EXISTS(
    SELECT 1 FROM jsonb_array_elements(baseline.typical_locations) loc
    WHERE (loc->>'country') = (p_location_data->>'country')
    AND (loc->>'region') = (p_location_data->>'region')
  ) INTO location_known;
  
  IF NOT location_known THEN
    anomaly_score := anomaly_score + 50;
    anomalies := anomalies || jsonb_build_object(
      'type', 'new_location',
      'details', format('Login from new location: %s, %s', 
        p_location_data->>'city', p_location_data->>'country')
    );
  END IF;
  
  -- Check device anomaly
  SELECT EXISTS(
    SELECT 1 FROM jsonb_array_elements(baseline.typical_devices) dev
    WHERE (dev->>'user_agent') = (p_device_data->>'user_agent')
    OR (dev->>'device_type') = (p_device_data->>'device_type')
  ) INTO device_known;
  
  IF NOT device_known THEN
    anomaly_score := anomaly_score + 40;
    anomalies := anomalies || jsonb_build_object(
      'type', 'new_device',
      'details', format('Login from new device: %s', p_device_data->>'device_type')
    );
  END IF;
  
  -- Log high-score anomalies
  IF anomaly_score >= 70 THEN
    INSERT INTO access_anomalies (
      user_id,
      anomaly_type,
      severity,
      pattern_data,
      detection_method,
      confidence_score,
      location_data,
      device_data
    ) VALUES (
      p_user_id,
      'login_anomaly',
      CASE 
        WHEN anomaly_score >= 100 THEN 'critical'
        WHEN anomaly_score >= 80 THEN 'high'
        ELSE 'medium'
      END,
      jsonb_build_object(
        'anomalies', anomalies,
        'total_score', anomaly_score
      ),
      'behavioral_analysis',
      anomaly_score,
      p_location_data,
      p_device_data
    );
    
    -- Create security alert for critical anomalies
    IF anomaly_score >= 100 THEN
      PERFORM create_security_alert(
        'critical_login_anomaly',
        'critical',
        'Critical Login Anomaly Detected',
        format('User %s logged in with highly unusual patterns (score: %s)', 
               p_user_id, anomaly_score),
        jsonb_build_object(
          'user_id', p_user_id,
          'anomaly_score', anomaly_score,
          'anomalies', anomalies,
          'requires_verification', true
        )
      );
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'is_anomaly', anomaly_score >= 70,
    'anomaly_score', anomaly_score,
    'anomalies', anomalies,
    'severity', CASE 
      WHEN anomaly_score >= 100 THEN 'critical'
      WHEN anomaly_score >= 80 THEN 'high'
      WHEN anomaly_score >= 70 THEN 'medium'
      ELSE 'low'
    END
  );
END;
$function$;

-- Function to update user behavior baseline
CREATE OR REPLACE FUNCTION public.update_user_baseline(
  p_user_id UUID,
  p_location_data JSONB,
  p_device_data JSONB,
  p_session_duration INTEGER DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_hour INTEGER;
BEGIN
  current_hour := EXTRACT(HOUR FROM now());
  
  INSERT INTO user_behavior_baselines (
    user_id,
    typical_login_hours,
    typical_locations,
    typical_devices,
    average_session_duration
  ) VALUES (
    p_user_id,
    jsonb_build_array(current_hour),
    jsonb_build_array(p_location_data),
    jsonb_build_array(p_device_data),
    COALESCE(p_session_duration, 0)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    typical_login_hours = CASE 
      WHEN NOT (user_behavior_baselines.typical_login_hours ? current_hour::text) 
      THEN user_behavior_baselines.typical_login_hours || current_hour::text::jsonb
      ELSE user_behavior_baselines.typical_login_hours
    END,
    typical_locations = CASE
      WHEN jsonb_array_length(user_behavior_baselines.typical_locations) < 10
      THEN user_behavior_baselines.typical_locations || p_location_data
      ELSE user_behavior_baselines.typical_locations
    END,
    typical_devices = CASE
      WHEN jsonb_array_length(user_behavior_baselines.typical_devices) < 5
      THEN user_behavior_baselines.typical_devices || p_device_data
      ELSE user_behavior_baselines.typical_devices
    END,
    average_session_duration = CASE
      WHEN p_session_duration IS NOT NULL
      THEN (COALESCE(user_behavior_baselines.average_session_duration, 0) + p_session_duration) / 2
      ELSE user_behavior_baselines.average_session_duration
    END,
    last_updated = now();
END;
$function$;

-- Function to analyze access patterns
CREATE OR REPLACE FUNCTION public.analyze_access_patterns() RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  suspicious_user RECORD;
BEGIN
  -- Detect rapid successive logins
  FOR suspicious_user IN
    SELECT 
      user_id,
      COUNT(*) as login_count,
      COUNT(DISTINCT ip_address) as unique_ips,
      MIN(created_at) as first_login,
      MAX(created_at) as last_login
    FROM login_locations 
    WHERE created_at > now() - interval '1 hour'
    GROUP BY user_id
    HAVING COUNT(*) >= 10 OR COUNT(DISTINCT ip_address) >= 5
  LOOP
    INSERT INTO access_anomalies (
      user_id,
      anomaly_type,
      severity,
      pattern_data,
      detection_method,
      confidence_score
    ) VALUES (
      suspicious_user.user_id,
      'rapid_login_pattern',
      CASE 
        WHEN suspicious_user.unique_ips >= 5 THEN 'critical'
        WHEN suspicious_user.login_count >= 15 THEN 'high'
        ELSE 'medium'
      END,
      jsonb_build_object(
        'login_count', suspicious_user.login_count,
        'unique_ips', suspicious_user.unique_ips,
        'time_span_minutes', EXTRACT(EPOCH FROM (suspicious_user.last_login - suspicious_user.first_login))/60
      ),
      'pattern_analysis',
      CASE 
        WHEN suspicious_user.unique_ips >= 5 THEN 95
        WHEN suspicious_user.login_count >= 15 THEN 85
        ELSE 75
      END
    );
  END LOOP;
  
  -- Log analysis completion
  INSERT INTO security_events (event_type, severity, details)
  VALUES (
    'access_pattern_analysis_completed',
    'low',
    jsonb_build_object(
      'timestamp', now(),
      'analysis_type', 'automated_pattern_detection'
    )
  );
END;
$function$;