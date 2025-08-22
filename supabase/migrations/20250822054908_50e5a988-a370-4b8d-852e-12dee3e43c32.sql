-- Create missing RPC functions for military security system

-- Device security risk assessment function
CREATE OR REPLACE FUNCTION assess_device_security_risk(
  p_device_fingerprint TEXT,
  p_user_agent TEXT,
  p_ip_address TEXT,
  p_geolocation JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trust_level INTEGER := 50;
  risk_factors TEXT[] := '{}';
  threat_indicators JSONB := '{}';
BEGIN
  -- Basic trust scoring
  trust_level := 50;
  
  -- Check user agent patterns
  IF p_user_agent ILIKE '%bot%' OR p_user_agent ILIKE '%crawler%' THEN
    trust_level := trust_level - 30;
    risk_factors := array_append(risk_factors, 'automated_client');
  END IF;
  
  -- Check for suspicious patterns
  IF length(p_device_fingerprint) < 20 THEN
    trust_level := trust_level - 20;
    risk_factors := array_append(risk_factors, 'weak_fingerprint');
  END IF;
  
  -- Geolocation check
  IF p_geolocation->>'country' != 'US' THEN
    trust_level := trust_level - 10;
    risk_factors := array_append(risk_factors, 'foreign_access');
  END IF;
  
  trust_level := GREATEST(0, LEAST(100, trust_level));
  
  RETURN jsonb_build_object(
    'trust_level', trust_level,
    'risk_factors', risk_factors,
    'threat_indicators', threat_indicators,
    'assessment_time', now()
  );
END;
$$;

-- User behavior analysis function
CREATE OR REPLACE FUNCTION analyze_user_behavior(
  p_user_id UUID,
  p_session_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  anomaly_score INTEGER := 0;
  baseline_behavior JSONB;
  current_behavior JSONB;
BEGIN
  -- Simple anomaly detection based on basic patterns
  anomaly_score := 0;
  
  -- Check for unusual access times
  IF EXTRACT(HOUR FROM NOW()) < 6 OR EXTRACT(HOUR FROM NOW()) > 22 THEN
    anomaly_score := anomaly_score + 20;
  END IF;
  
  -- Check for weekend access
  IF EXTRACT(DOW FROM NOW()) IN (0, 6) THEN
    anomaly_score := anomaly_score + 10;
  END IF;
  
  -- Random variation for demonstration
  anomaly_score := anomaly_score + (random() * 20)::INTEGER;
  
  anomaly_score := GREATEST(0, LEAST(100, anomaly_score));
  
  RETURN jsonb_build_object(
    'anomaly_score', anomaly_score,
    'risk_level', CASE 
      WHEN anomaly_score > 80 THEN 'critical'
      WHEN anomaly_score > 60 THEN 'high'
      WHEN anomaly_score > 40 THEN 'medium'
      ELSE 'low'
    END,
    'behavioral_factors', ARRAY['access_time', 'session_pattern'],
    'analysis_time', now()
  );
END;
$$;

-- Zero trust access evaluation function
CREATE OR REPLACE FUNCTION evaluate_zero_trust_access(
  p_user_id UUID,
  p_resource_path TEXT,
  p_context JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  access_score INTEGER := 0;
  access_granted BOOLEAN := false;
  evaluation_factors TEXT[] := '{}';
BEGIN
  -- Base score for authenticated user
  access_score := 30;
  
  -- Check if user is admin
  IF is_admin(p_user_id) THEN
    access_score := access_score + 40;
    evaluation_factors := array_append(evaluation_factors, 'admin_role');
  END IF;
  
  -- Check device trust
  IF (p_context->>'device_trust')::BOOLEAN THEN
    access_score := access_score + 20;
    evaluation_factors := array_append(evaluation_factors, 'trusted_device');
  END IF;
  
  -- Check MFA compliance
  IF (p_context->>'mfa_compliant')::BOOLEAN THEN
    access_score := access_score + 20;
    evaluation_factors := array_append(evaluation_factors, 'mfa_verified');
  END IF;
  
  -- Determine access
  access_granted := access_score >= 70;
  
  RETURN jsonb_build_object(
    'access_granted', access_granted,
    'access_score', access_score,
    'evaluation_factors', evaluation_factors,
    'resource_path', p_resource_path,
    'evaluation_time', now()
  );
END;
$$;

-- Compliance audit logging function
CREATE OR REPLACE FUNCTION log_compliance_audit(
  p_audit_category TEXT,
  p_compliance_framework TEXT,
  p_resource_type TEXT,
  p_action_type TEXT,
  p_action_details JSONB,
  p_data_sensitivity TEXT DEFAULT 'internal'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO compliance_audit_trail (
    audit_category,
    compliance_framework,
    resource_type,
    action_type,
    action_details,
    data_sensitivity,
    user_id,
    admin_user_id
  ) VALUES (
    p_audit_category,
    p_compliance_framework,
    p_resource_type,
    p_action_type,
    p_action_details,
    p_data_sensitivity::data_classification,
    auth.uid(),
    CASE WHEN is_admin(auth.uid()) THEN auth.uid() ELSE NULL END
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;