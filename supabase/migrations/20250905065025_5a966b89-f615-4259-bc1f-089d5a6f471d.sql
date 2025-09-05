-- Create tables for AI-powered threat detection system

-- AI threat analysis results table
CREATE TABLE IF NOT EXISTS public.ai_threat_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_type text NOT NULL DEFAULT 'batch',
  threat_level text NOT NULL CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  threat_type text NOT NULL,
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
  risk_score integer CHECK (risk_score >= 0 AND risk_score <= 100),
  reasoning text,
  recommended_actions jsonb DEFAULT '[]'::jsonb,
  detected_patterns jsonb DEFAULT '[]'::jsonb,
  analysis_data jsonb DEFAULT '{}'::jsonb,
  events_analyzed integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Advanced security alerts table
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  resolved_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Behavioral analysis table for user patterns
CREATE TABLE IF NOT EXISTS public.user_behavioral_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  behavior_type text NOT NULL,
  baseline_metrics jsonb DEFAULT '{}'::jsonb,
  current_metrics jsonb DEFAULT '{}'::jsonb,
  anomaly_score numeric(5,2) DEFAULT 0.00,
  risk_factors jsonb DEFAULT '[]'::jsonb,
  analysis_period interval DEFAULT '7 days'::interval,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Threat intelligence patterns table
CREATE TABLE IF NOT EXISTS public.threat_intelligence_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name text UNIQUE NOT NULL,
  pattern_type text NOT NULL,
  detection_rules jsonb NOT NULL,
  threat_level text CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  confidence_threshold numeric(3,2) DEFAULT 0.70,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.ai_threat_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavioral_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_intelligence_patterns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admins can manage AI threat analyses" 
ON public.ai_threat_analyses 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin', 'tech_support_admin') 
    AND ur.is_active = true
  )
);

CREATE POLICY "Admins can manage security alerts" 
ON public.security_alerts 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin', 'tech_support_admin') 
    AND ur.is_active = true
  )
);

CREATE POLICY "Users can view their own behavioral analytics" 
ON public.user_behavioral_analytics 
FOR SELECT
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin', 'tech_support_admin') 
    AND ur.is_active = true
  )
);

CREATE POLICY "Admins can manage threat intelligence patterns" 
ON public.threat_intelligence_patterns 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin', 'tech_support_admin') 
    AND ur.is_active = true
  )
);

-- Create indexes for performance
CREATE INDEX idx_ai_threat_analyses_threat_level ON public.ai_threat_analyses(threat_level);
CREATE INDEX idx_ai_threat_analyses_created_at ON public.ai_threat_analyses(created_at DESC);
CREATE INDEX idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX idx_security_alerts_is_resolved ON public.security_alerts(is_resolved);
CREATE INDEX idx_user_behavioral_analytics_user_id ON public.user_behavioral_analytics(user_id);
CREATE INDEX idx_user_behavioral_analytics_anomaly_score ON public.user_behavioral_analytics(anomaly_score DESC);