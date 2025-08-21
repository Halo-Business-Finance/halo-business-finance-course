-- Military-Grade Enterprise Security Infrastructure

-- Device Management and Fingerprinting
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT, -- mobile, desktop, tablet
  browser_info JSONB,
  os_info JSONB,
  hardware_info JSONB,
  screen_resolution TEXT,
  timezone TEXT,
  language TEXT,
  is_trusted BOOLEAN DEFAULT false,
  trust_level INTEGER DEFAULT 0, -- 0-100 trust score
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_ip INET,
  geolocation JSONB,
  security_flags JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  blocked_at TIMESTAMP WITH TIME ZONE,
  blocked_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, device_fingerprint)
);

-- Multi-Factor Authentication
CREATE TABLE IF NOT EXISTS public.user_mfa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL, -- totp, sms, email, hardware_key, biometric
  method_name TEXT,
  secret_key TEXT, -- encrypted
  backup_codes TEXT[], -- encrypted
  is_enabled BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advanced Session Management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_id UUID REFERENCES public.user_devices(id),
  ip_address INET,
  user_agent TEXT,
  geolocation JSONB,
  security_level INTEGER DEFAULT 0, -- 0-10 security clearance
  session_type TEXT DEFAULT 'standard', -- standard, elevated, emergency
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  terminated_at TIMESTAMP WITH TIME ZONE,
  termination_reason TEXT,
  security_context JSONB DEFAULT '{}',
  risk_score INTEGER DEFAULT 0 -- 0-100 risk assessment
);

-- Biometric Authentication
CREATE TABLE IF NOT EXISTS public.user_biometrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  biometric_type TEXT NOT NULL, -- fingerprint, face, voice, iris
  biometric_hash TEXT NOT NULL, -- hashed biometric data
  template_data BYTEA, -- encrypted biometric template
  device_id UUID REFERENCES public.user_devices(id),
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  quality_score INTEGER, -- 0-100 biometric quality
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Geolocation Security
CREATE TABLE IF NOT EXISTS public.geolocation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL, -- allow, deny, require_mfa
  country_codes TEXT[], -- ISO country codes
  region_codes TEXT[],
  ip_ranges INET[],
  latitude_range DECIMAL[],
  longitude_range DECIMAL[],
  radius_km INTEGER,
  time_restrictions JSONB, -- time-based access rules
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advanced Threat Detection
CREATE TABLE IF NOT EXISTS public.threat_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_type TEXT NOT NULL,
  indicator_type TEXT NOT NULL, -- ip, domain, hash, pattern
  indicator_value TEXT NOT NULL,
  threat_level INTEGER NOT NULL, -- 1-10 severity
  confidence_score INTEGER, -- 0-100 confidence
  source TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Security Policies
CREATE TABLE IF NOT EXISTS public.security_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name TEXT NOT NULL UNIQUE,
  policy_type TEXT NOT NULL, -- access, authentication, session, data
  policy_rules JSONB NOT NULL,
  enforcement_level TEXT DEFAULT 'enforce', -- monitor, warn, enforce, block
  applies_to TEXT[] DEFAULT ARRAY['all'], -- user roles or 'all'
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  effective_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Behavior Analytics
CREATE TABLE IF NOT EXISTS public.user_behavior_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- login_time, location, device, activity
  pattern_data JSONB NOT NULL,
  confidence_score DECIMAL(5,2), -- 0.00-100.00
  anomaly_score DECIMAL(5,2), -- 0.00-100.00 higher = more anomalous
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sample_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Security Incidents
CREATE TABLE IF NOT EXISTS public.security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL, -- low, medium, high, critical, emergency
  status TEXT DEFAULT 'open', -- open, investigating, contained, resolved, closed
  title TEXT NOT NULL,
  description TEXT,
  affected_users UUID[],
  affected_systems TEXT[],
  indicators JSONB,
  timeline JSONB DEFAULT '[]',
  response_actions JSONB DEFAULT '[]',
  lessons_learned TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  reported_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mfa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geolocation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_devices
CREATE POLICY "Users can manage their own devices" ON public.user_devices
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all devices" ON public.user_devices
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for user_mfa
CREATE POLICY "Users can manage their own MFA" ON public.user_mfa
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view MFA status" ON public.user_mfa
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions" ON public.user_sessions
  FOR ALL USING (auth.uid() IS NULL OR is_admin(auth.uid()));

-- RLS Policies for user_biometrics
CREATE POLICY "Users can manage their own biometrics" ON public.user_biometrics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view biometric status" ON public.user_biometrics
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for geolocation_rules
CREATE POLICY "Users can manage their geo rules" ON public.geolocation_rules
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can manage all geo rules" ON public.geolocation_rules
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for threat_intelligence
CREATE POLICY "Only admins can access threat intel" ON public.threat_intelligence
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for security_policies
CREATE POLICY "Only admins can manage policies" ON public.security_policies
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for user_behavior_patterns
CREATE POLICY "Users can view their own patterns" ON public.user_behavior_patterns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage behavior patterns" ON public.user_behavior_patterns
  FOR ALL USING (auth.uid() IS NULL OR is_admin(auth.uid()));

-- RLS Policies for security_incidents
CREATE POLICY "Only admins can manage incidents" ON public.security_incidents
  FOR ALL USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_user_devices_user_id ON public.user_devices(user_id);
CREATE INDEX idx_user_devices_fingerprint ON public.user_devices(device_fingerprint);
CREATE INDEX idx_user_devices_last_seen ON public.user_devices(last_seen_at);

CREATE INDEX idx_user_mfa_user_id ON public.user_mfa(user_id);
CREATE INDEX idx_user_mfa_method_type ON public.user_mfa(method_type);

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON public.user_sessions(expires_at);

CREATE INDEX idx_threat_intel_indicator ON public.threat_intelligence(indicator_value);
CREATE INDEX idx_threat_intel_type ON public.threat_intelligence(threat_type);

CREATE INDEX idx_behavior_patterns_user_id ON public.user_behavior_patterns(user_id);
CREATE INDEX idx_behavior_patterns_type ON public.user_behavior_patterns(pattern_type);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_devices_updated_at BEFORE UPDATE ON public.user_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_mfa_updated_at BEFORE UPDATE ON public.user_mfa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON public.user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_biometrics_updated_at BEFORE UPDATE ON public.user_biometrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_geolocation_rules_updated_at BEFORE UPDATE ON public.geolocation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_policies_updated_at BEFORE UPDATE ON public.security_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON public.security_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();