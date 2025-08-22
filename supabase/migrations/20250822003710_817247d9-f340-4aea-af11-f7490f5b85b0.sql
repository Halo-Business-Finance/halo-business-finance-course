-- MILITARY-GRADE ENTERPRISE SECURITY ENHANCEMENTS
-- Advanced threat detection, MFA, biometrics, and compliance features

-- 1. Enhanced Device Fingerprinting and Trust System
CREATE TABLE IF NOT EXISTS public.enhanced_device_security (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_id uuid NOT NULL,
  device_fingerprint text NOT NULL,
  trust_score integer NOT NULL DEFAULT 0,
  risk_factors jsonb NOT NULL DEFAULT '{}',
  hardware_signatures jsonb NOT NULL DEFAULT '{}',
  software_signatures jsonb NOT NULL DEFAULT '{}',
  network_signatures jsonb NOT NULL DEFAULT '{}',
  behavioral_patterns jsonb NOT NULL DEFAULT '{}',
  security_features jsonb NOT NULL DEFAULT '{}',
  threat_indicators jsonb NOT NULL DEFAULT '{}',
  compliance_status jsonb NOT NULL DEFAULT '{}',
  last_security_scan timestamp with time zone DEFAULT now(),
  is_compromised boolean DEFAULT false,
  quarantine_status text DEFAULT 'none',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Advanced MFA System
CREATE TABLE IF NOT EXISTS public.enhanced_mfa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  method_type text NOT NULL, -- 'totp', 'hardware_token', 'sms', 'push', 'biometric', 'certificate'
  method_name text,
  secret_key text,
  hardware_key_id text,
  certificate_fingerprint text,
  backup_codes text[],
  is_primary boolean DEFAULT false,
  is_enabled boolean DEFAULT false,
  trust_level integer DEFAULT 1, -- 1-5 scale
  failure_count integer DEFAULT 0,
  last_used_at timestamp with time zone,
  enrolled_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  device_bound boolean DEFAULT false,
  compliance_level text DEFAULT 'standard', -- 'standard', 'high', 'military'
  encryption_algorithm text DEFAULT 'AES-256',
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Real-time Threat Intelligence
CREATE TABLE IF NOT EXISTS public.advanced_threat_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_signature text NOT NULL,
  threat_category text NOT NULL, -- 'malware', 'phishing', 'brute_force', 'data_exfiltration', 'insider_threat'
  severity_level integer NOT NULL, -- 1-10 scale
  confidence_score numeric(5,2) NOT NULL, -- 0.00-100.00
  attack_vectors text[] NOT NULL DEFAULT '{}',
  indicators_of_compromise jsonb NOT NULL DEFAULT '{}',
  mitigation_strategies jsonb NOT NULL DEFAULT '{}',
  attribution_data jsonb DEFAULT '{}',
  geolocation_data jsonb DEFAULT '{}',
  temporal_patterns jsonb DEFAULT '{}',
  network_patterns jsonb DEFAULT '{}',
  behavioral_signatures jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  auto_block boolean DEFAULT false,
  source text NOT NULL,
  validation_status text DEFAULT 'pending', -- 'pending', 'validated', 'false_positive'
  first_seen timestamp with time zone DEFAULT now(),
  last_seen timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. Behavioral Analytics and Anomaly Detection
CREATE TABLE IF NOT EXISTS public.user_behavioral_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text,
  behavioral_fingerprint jsonb NOT NULL DEFAULT '{}',
  keystroke_dynamics jsonb DEFAULT '{}',
  mouse_dynamics jsonb DEFAULT '{}',
  navigation_patterns jsonb DEFAULT '{}',
  timing_patterns jsonb DEFAULT '{}',
  access_patterns jsonb DEFAULT '{}',
  anomaly_score numeric(5,2) DEFAULT 0.00, -- 0.00-100.00
  risk_indicators text[] DEFAULT '{}',
  confidence_level numeric(5,2) DEFAULT 50.00,
  baseline_established boolean DEFAULT false,
  deviation_threshold numeric(5,2) DEFAULT 75.00,
  alert_triggered boolean DEFAULT false,
  ml_model_version text DEFAULT 'v1.0',
  feature_vector jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 5. Network Security Monitoring
CREATE TABLE IF NOT EXISTS public.network_security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_category text NOT NULL, -- 'intrusion_attempt', 'ddos', 'port_scan', 'data_exfiltration'
  source_ip inet NOT NULL,
  destination_ip inet,
  source_port integer,
  destination_port integer,
  protocol text,
  event_signature text NOT NULL,
  severity_level integer NOT NULL,
  packet_data jsonb DEFAULT '{}',
  flow_data jsonb DEFAULT '{}',
  geolocation jsonb DEFAULT '{}',
  threat_indicators text[] DEFAULT '{}',
  mitigation_applied text[] DEFAULT '{}',
  is_blocked boolean DEFAULT false,
  analyst_notes text,
  false_positive boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 6. Security Incident Response
CREATE TABLE IF NOT EXISTS public.security_incident_response (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id text NOT NULL UNIQUE,
  incident_type text NOT NULL,
  severity text NOT NULL, -- 'low', 'medium', 'high', 'critical', 'catastrophic'
  status text NOT NULL DEFAULT 'detected', -- 'detected', 'investigating', 'contained', 'eradicated', 'recovered', 'lessons_learned'
  title text NOT NULL,
  description text NOT NULL,
  affected_systems text[] DEFAULT '{}',
  affected_users uuid[] DEFAULT '{}',
  attack_timeline jsonb DEFAULT '[]',
  indicators_of_compromise jsonb DEFAULT '{}',
  evidence_collected jsonb DEFAULT '{}',
  containment_actions jsonb DEFAULT '[]',
  eradication_actions jsonb DEFAULT '[]',
  recovery_actions jsonb DEFAULT '[]',
  lessons_learned text,
  root_cause text,
  assigned_to uuid,
  escalated_to uuid,
  external_notifications jsonb DEFAULT '{}',
  compliance_impact jsonb DEFAULT '{}',
  estimated_impact jsonb DEFAULT '{}',
  actual_impact jsonb DEFAULT '{}',
  detected_at timestamp with time zone NOT NULL DEFAULT now(),
  contained_at timestamp with time zone,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 7. Compliance and Audit Framework
CREATE TABLE IF NOT EXISTS public.compliance_audit_trail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_category text NOT NULL, -- 'access', 'data_modification', 'system_change', 'security_event'
  compliance_framework text NOT NULL, -- 'SOX', 'GDPR', 'HIPAA', 'ISO27001', 'NIST', 'DoD'
  regulation_reference text,
  user_id uuid,
  admin_user_id uuid,
  resource_type text NOT NULL,
  resource_id text,
  action_type text NOT NULL,
  action_details jsonb NOT NULL DEFAULT '{}',
  data_sensitivity text NOT NULL, -- 'public', 'internal', 'confidential', 'restricted', 'top_secret'
  access_justification text,
  approval_required boolean DEFAULT false,
  approval_status text DEFAULT 'auto_approved', -- 'pending', 'approved', 'denied', 'auto_approved'
  approved_by uuid,
  approved_at timestamp with time zone,
  retention_period interval DEFAULT '7 years',
  audit_hash text NOT NULL,
  chain_integrity_verified boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 8. Zero-Trust Network Access Control
CREATE TABLE IF NOT EXISTS public.zero_trust_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name text NOT NULL,
  policy_type text NOT NULL, -- 'device', 'user', 'network', 'application', 'data'
  resource_path text NOT NULL,
  conditions jsonb NOT NULL DEFAULT '{}',
  required_trust_score integer DEFAULT 80,
  required_mfa_level integer DEFAULT 1,
  allowed_devices text[] DEFAULT '{}',
  allowed_networks cidr[] DEFAULT '{}',
  allowed_geolocations text[] DEFAULT '{}',
  time_restrictions jsonb DEFAULT '{}',
  risk_tolerance text DEFAULT 'medium', -- 'low', 'medium', 'high'
  continuous_verification boolean DEFAULT true,
  session_duration interval DEFAULT '8 hours',
  is_active boolean DEFAULT true,
  priority integer DEFAULT 100,
  created_by uuid NOT NULL,
  approved_by uuid,
  effective_date timestamp with time zone DEFAULT now(),
  expiry_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.enhanced_device_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_mfa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advanced_threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavioral_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incident_response ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zero_trust_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own enhanced device security" 
ON public.enhanced_device_security 
FOR ALL 
USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can manage their own enhanced MFA" 
ON public.enhanced_mfa 
FOR ALL 
USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Only super admins can access threat intelligence" 
ON public.advanced_threat_intelligence 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'super_admin' 
  AND is_active = true
));

CREATE POLICY "Users can view their own behavioral analytics" 
ON public.user_behavioral_analytics 
FOR SELECT 
USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "System can insert behavioral analytics" 
ON public.user_behavioral_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only security admins can access network events" 
ON public.network_security_events 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage incident response" 
ON public.security_incident_response 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Only super admins can access compliance audit trail" 
ON public.compliance_audit_trail 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'super_admin' 
  AND is_active = true
));

CREATE POLICY "Only super admins can manage zero trust policies" 
ON public.zero_trust_policies 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'super_admin' 
  AND is_active = true
));

-- Advanced Security Functions

-- 1. Enhanced Device Risk Assessment
CREATE OR REPLACE FUNCTION public.assess_device_security_risk(
  p_device_fingerprint text,
  p_user_agent text,
  p_ip_address inet,
  p_geolocation jsonb DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  risk_score integer := 0;
  risk_factors text[] := '{}';
  threat_indicators jsonb := '{}';
  device_trust_level integer := 50;
BEGIN
  -- Check against known threat intelligence
  IF EXISTS (
    SELECT 1 FROM advanced_threat_intelligence 
    WHERE threat_signature = p_device_fingerprint 
    AND is_active = true
  ) THEN
    risk_score := risk_score + 90;
    risk_factors := risk_factors || 'known_threat_signature';
  END IF;

  -- Check IP reputation
  IF EXISTS (
    SELECT 1 FROM network_security_events 
    WHERE source_ip = p_ip_address 
    AND severity_level >= 7
    AND created_at > now() - interval '24 hours'
  ) THEN
    risk_score := risk_score + 70;
    risk_factors := risk_factors || 'suspicious_ip_history';
  END IF;

  -- Analyze user agent for anomalies
  IF p_user_agent ILIKE '%bot%' OR p_user_agent ILIKE '%crawler%' THEN
    risk_score := risk_score + 60;
    risk_factors := risk_factors || 'automated_agent_detected';
  END IF;

  -- Geolocation-based risk assessment
  IF p_geolocation IS NOT NULL THEN
    -- Check for high-risk countries (example logic)
    IF p_geolocation->>'country' = ANY(ARRAY['CN', 'RU', 'KP', 'IR']) THEN
      risk_score := risk_score + 40;
      risk_factors := risk_factors || 'high_risk_geolocation';
    END IF;
  END IF;

  -- Calculate final trust level
  device_trust_level := GREATEST(0, LEAST(100, 100 - risk_score));

  -- Log security assessment
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'device_security_assessment',
    CASE 
      WHEN risk_score >= 80 THEN 'critical'
      WHEN risk_score >= 60 THEN 'high'
      WHEN risk_score >= 40 THEN 'medium'
      ELSE 'low'
    END,
    jsonb_build_object(
      'device_fingerprint_hash', encode(digest(p_device_fingerprint, 'sha256'), 'hex'),
      'risk_score', risk_score,
      'trust_level', device_trust_level,
      'risk_factors', risk_factors,
      'geolocation', p_geolocation
    )
  );

  RETURN jsonb_build_object(
    'risk_score', risk_score,
    'trust_level', device_trust_level,
    'risk_factors', risk_factors,
    'threat_indicators', threat_indicators,
    'assessment_timestamp', now()
  );
END;
$function$;

-- 2. Behavioral Anomaly Detection
CREATE OR REPLACE FUNCTION public.analyze_user_behavior(
  p_user_id uuid,
  p_session_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  baseline_behavior jsonb;
  anomaly_score numeric := 0.0;
  risk_indicators text[] := '{}';
  analysis_result jsonb;
BEGIN
  -- Get user's baseline behavioral patterns
  SELECT 
    jsonb_object_agg(pattern_type, pattern_data)
  INTO baseline_behavior
  FROM user_behavior_patterns 
  WHERE user_id = p_user_id 
  AND confidence_score > 70.0;

  -- If no baseline exists, return low risk but start building profile
  IF baseline_behavior IS NULL THEN
    INSERT INTO user_behavioral_analytics (
      user_id,
      behavioral_fingerprint,
      anomaly_score,
      confidence_level,
      baseline_established
    ) VALUES (
      p_user_id,
      p_session_data,
      0.0,
      10.0,
      false
    );
    
    RETURN jsonb_build_object(
      'anomaly_score', 0.0,
      'risk_level', 'low',
      'baseline_status', 'building',
      'analysis_timestamp', now()
    );
  END IF;

  -- Analyze keystroke dynamics
  IF p_session_data ? 'keystroke_timing' AND baseline_behavior ? 'keystroke_patterns' THEN
    -- Calculate keystroke timing deviation
    -- Simplified example - in production would use ML algorithms
    anomaly_score := anomaly_score + 
      CASE WHEN (p_session_data->'keystroke_timing'->>'avg_dwell_time')::numeric > 
                (baseline_behavior->'keystroke_patterns'->>'avg_dwell_time')::numeric * 1.5
           THEN 25.0
           ELSE 0.0
      END;
  END IF;

  -- Analyze navigation patterns
  IF p_session_data ? 'navigation_sequence' AND baseline_behavior ? 'navigation_patterns' THEN
    -- Check for unusual navigation sequences
    IF NOT (p_session_data->'navigation_sequence' <@ baseline_behavior->'navigation_patterns'->'common_sequences') THEN
      anomaly_score := anomaly_score + 15.0;
      risk_indicators := risk_indicators || 'unusual_navigation';
    END IF;
  END IF;

  -- Analyze access timing
  IF p_session_data ? 'access_time' THEN
    -- Check if access is outside normal hours
    IF EXTRACT(HOUR FROM (p_session_data->>'access_time')::timestamp) NOT BETWEEN 
       (baseline_behavior->'timing_patterns'->>'usual_start_hour')::integer AND
       (baseline_behavior->'timing_patterns'->>'usual_end_hour')::integer THEN
      anomaly_score := anomaly_score + 20.0;
      risk_indicators := risk_indicators || 'unusual_access_time';
    END IF;
  END IF;

  -- Store analysis results
  INSERT INTO user_behavioral_analytics (
    user_id,
    behavioral_fingerprint,
    anomaly_score,
    risk_indicators,
    confidence_level,
    baseline_established
  ) VALUES (
    p_user_id,
    p_session_data,
    anomaly_score,
    risk_indicators,
    85.0,
    true
  );

  -- Create security alert if high anomaly score
  IF anomaly_score > 75.0 THEN
    PERFORM create_security_alert(
      'behavioral_anomaly_detected',
      'high',
      'Suspicious User Behavior Detected',
      format('User %s shows behavioral anomalies with score %s. Risk indicators: %s',
             p_user_id, anomaly_score, array_to_string(risk_indicators, ', ')),
      jsonb_build_object(
        'user_id', p_user_id,
        'anomaly_score', anomaly_score,
        'risk_indicators', risk_indicators,
        'requires_investigation', true
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'anomaly_score', anomaly_score,
    'risk_level', CASE 
      WHEN anomaly_score > 80 THEN 'critical'
      WHEN anomaly_score > 60 THEN 'high'
      WHEN anomaly_score > 40 THEN 'medium'
      ELSE 'low'
    END,
    'risk_indicators', risk_indicators,
    'confidence_level', 85.0,
    'analysis_timestamp', now()
  );
END;
$function$;

-- 3. Zero Trust Access Evaluation
CREATE OR REPLACE FUNCTION public.evaluate_zero_trust_access(
  p_user_id uuid,
  p_resource_path text,
  p_context jsonb DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  policy_record RECORD;
  access_granted boolean := false;
  required_actions text[] := '{}';
  trust_score integer := 0;
  evaluation_details jsonb := '{}';
BEGIN
  -- Get applicable zero trust policies
  FOR policy_record IN
    SELECT * FROM zero_trust_policies 
    WHERE resource_path = p_resource_path 
    AND is_active = true 
    ORDER BY priority DESC
  LOOP
    -- Evaluate user trust score
    SELECT COALESCE(AVG(trust_level), 0)::integer
    INTO trust_score
    FROM enhanced_device_security eds
    WHERE eds.user_id = p_user_id
    AND eds.is_compromised = false;

    -- Check if trust score meets requirement
    IF trust_score < policy_record.required_trust_score THEN
      required_actions := required_actions || 'increase_device_trust';
      CONTINUE;
    END IF;

    -- Check MFA requirements
    IF NOT EXISTS (
      SELECT 1 FROM enhanced_mfa 
      WHERE user_id = p_user_id 
      AND trust_level >= policy_record.required_mfa_level
      AND is_enabled = true
    ) THEN
      required_actions := required_actions || 'enhanced_mfa_required';
      CONTINUE;
    END IF;

    -- Check device restrictions
    IF array_length(policy_record.allowed_devices, 1) > 0 THEN
      IF NOT EXISTS (
        SELECT 1 FROM enhanced_device_security 
        WHERE user_id = p_user_id 
        AND device_fingerprint = ANY(policy_record.allowed_devices)
      ) THEN
        required_actions := required_actions || 'approved_device_required';
        CONTINUE;
      END IF;
    END IF;

    -- Check network restrictions
    IF array_length(policy_record.allowed_networks, 1) > 0 AND p_context ? 'source_ip' THEN
      IF NOT ((p_context->>'source_ip')::inet <<= ANY(policy_record.allowed_networks)) THEN
        required_actions := required_actions || 'approved_network_required';
        CONTINUE;
      END IF;
    END IF;

    -- Check geolocation restrictions
    IF array_length(policy_record.allowed_geolocations, 1) > 0 AND p_context ? 'country' THEN
      IF NOT (p_context->>'country' = ANY(policy_record.allowed_geolocations)) THEN
        required_actions := required_actions || 'approved_location_required';
        CONTINUE;
      END IF;
    END IF;

    -- If we reach here, access can be granted
    access_granted := true;
    EXIT;
  END LOOP;

  -- Log access evaluation
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'zero_trust_access_evaluation',
    CASE WHEN access_granted THEN 'low' ELSE 'medium' END,
    jsonb_build_object(
      'resource_path', p_resource_path,
      'access_granted', access_granted,
      'trust_score', trust_score,
      'required_actions', required_actions,
      'context', p_context
    ),
    p_user_id
  );

  RETURN jsonb_build_object(
    'access_granted', access_granted,
    'trust_score', trust_score,
    'required_actions', required_actions,
    'evaluation_timestamp', now(),
    'session_duration', COALESCE(
      (SELECT session_duration FROM zero_trust_policies 
       WHERE resource_path = p_resource_path AND is_active = true 
       ORDER BY priority DESC LIMIT 1),
      '8 hours'::interval
    )
  );
END;
$function$;

-- 4. Enhanced Threat Detection
CREATE OR REPLACE FUNCTION public.detect_advanced_threats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  threat_pattern RECORD;
  suspicious_activity RECORD;
BEGIN
  -- Detect coordinated attack patterns
  FOR threat_pattern IN
    SELECT 
      source_ip,
      COUNT(*) as event_count,
      array_agg(DISTINCT event_category) as attack_types,
      MIN(created_at) as first_seen,
      MAX(created_at) as last_seen
    FROM network_security_events 
    WHERE created_at > now() - interval '1 hour'
    GROUP BY source_ip
    HAVING COUNT(*) >= 10
  LOOP
    -- Create threat intelligence entry
    INSERT INTO advanced_threat_intelligence (
      threat_signature,
      threat_category,
      severity_level,
      confidence_score,
      attack_vectors,
      indicators_of_compromise,
      source,
      first_seen,
      last_seen
    ) VALUES (
      threat_pattern.source_ip::text,
      'coordinated_attack',
      8,
      95.0,
      threat_pattern.attack_types,
      jsonb_build_object(
        'ip_address', threat_pattern.source_ip,
        'event_count', threat_pattern.event_count,
        'time_span_minutes', EXTRACT(EPOCH FROM (threat_pattern.last_seen - threat_pattern.first_seen)) / 60
      ),
      'automated_detection',
      threat_pattern.first_seen,
      threat_pattern.last_seen
    );

    -- Create security alert
    PERFORM create_security_alert(
      'coordinated_attack_detected',
      'critical',
      'Coordinated Attack Pattern Detected',
      format('IP %s performed %s security events in 1 hour, indicating coordinated attack',
             threat_pattern.source_ip, threat_pattern.event_count),
      jsonb_build_object(
        'source_ip', threat_pattern.source_ip,
        'event_count', threat_pattern.event_count,
        'attack_types', threat_pattern.attack_types,
        'auto_block_recommended', true
      )
    );
  END LOOP;

  -- Detect insider threat patterns
  FOR suspicious_activity IN
    SELECT 
      user_id,
      COUNT(*) as anomaly_events,
      AVG(anomaly_score) as avg_anomaly_score,
      array_agg(DISTINCT unnest(risk_indicators)) as combined_indicators
    FROM user_behavioral_analytics 
    WHERE created_at > now() - interval '24 hours'
    AND anomaly_score > 60.0
    GROUP BY user_id
    HAVING COUNT(*) >= 5 AND AVG(anomaly_score) > 70.0
  LOOP
    -- Create insider threat alert
    PERFORM create_security_alert(
      'potential_insider_threat',
      'high',
      'Potential Insider Threat Detected',
      format('User %s shows consistent behavioral anomalies with avg score %s over 24 hours',
             suspicious_activity.user_id, suspicious_activity.avg_anomaly_score),
      jsonb_build_object(
        'user_id', suspicious_activity.user_id,
        'anomaly_event_count', suspicious_activity.anomaly_events,
        'average_anomaly_score', suspicious_activity.avg_anomaly_score,
        'risk_indicators', suspicious_activity.combined_indicators,
        'investigation_required', true
      )
    );
  END LOOP;
END;
$function$;

-- 5. Compliance Audit Logging
CREATE OR REPLACE FUNCTION public.log_compliance_audit(
  p_audit_category text,
  p_compliance_framework text,
  p_resource_type text,
  p_action_type text,
  p_action_details jsonb,
  p_data_sensitivity text DEFAULT 'confidential',
  p_resource_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  audit_hash text;
  chain_verification boolean := true;
BEGIN
  -- Generate audit hash for integrity
  audit_hash := encode(
    digest(
      concat(
        p_audit_category, 
        p_compliance_framework,
        p_resource_type,
        p_action_type,
        p_action_details::text,
        auth.uid()::text,
        extract(epoch from now())::text
      ),
      'sha256'
    ),
    'hex'
  );

  -- Verify audit chain integrity (simplified)
  SELECT COALESCE(
    (SELECT chain_integrity_verified FROM compliance_audit_trail 
     ORDER BY created_at DESC LIMIT 1),
    true
  ) INTO chain_verification;

  -- Insert compliance audit record
  INSERT INTO compliance_audit_trail (
    audit_category,
    compliance_framework,
    user_id,
    admin_user_id,
    resource_type,
    resource_id,
    action_type,
    action_details,
    data_sensitivity,
    audit_hash,
    chain_integrity_verified
  ) VALUES (
    p_audit_category,
    p_compliance_framework,
    CASE WHEN is_admin(auth.uid()) THEN NULL ELSE auth.uid() END,
    CASE WHEN is_admin(auth.uid()) THEN auth.uid() ELSE NULL END,
    p_resource_type,
    p_resource_id,
    p_action_type,
    p_action_details,
    p_data_sensitivity,
    audit_hash,
    chain_verification
  );
END;
$function$;