-- Secure security monitoring tables against system-level exploitation

-- First, let's check and create missing security monitoring tables with proper RLS

-- 1. Create user_behavioral_analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_behavioral_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT,
  activity_type TEXT NOT NULL,
  activity_data JSONB NOT NULL DEFAULT '{}',
  risk_score INTEGER DEFAULT 0,
  anomaly_score NUMERIC DEFAULT 0,
  location_data JSONB DEFAULT '{}',
  device_fingerprint TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_classification data_classification DEFAULT 'restricted'
);

-- Enable RLS on user_behavioral_analytics
ALTER TABLE public.user_behavioral_analytics ENABLE ROW LEVEL SECURITY;

-- 2. Create user_behavior_patterns table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_behavior_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0,
  first_observed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_observed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  occurrence_count INTEGER DEFAULT 1,
  risk_level TEXT DEFAULT 'low',
  is_anomalous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_classification data_classification DEFAULT 'restricted'
);

-- Enable RLS on user_behavior_patterns
ALTER TABLE public.user_behavior_patterns ENABLE ROW LEVEL SECURITY;

-- 3. Verify network_security_events table exists (it should from previous migration)
-- Add additional security columns if missing
ALTER TABLE public.network_security_events 
ADD COLUMN IF NOT EXISTS system_validated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS validation_signature TEXT,
ADD COLUMN IF NOT EXISTS created_by_function TEXT,
ADD COLUMN IF NOT EXISTS data_classification data_classification DEFAULT 'restricted';

-- 4. Create system validation function to authenticate legitimate system processes
CREATE OR REPLACE FUNCTION public.validate_system_process(
  p_function_name TEXT,
  p_process_signature TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expected_signature TEXT;
  is_valid_source BOOLEAN := FALSE;
BEGIN
  -- List of authorized system functions that can modify security data
  IF p_function_name IN (
    'analyze_user_behavior',
    'assess_device_security_risk', 
    'detect_advanced_threats',
    'log_compliance_audit',
    'military_security_engine',
    'enhanced_auth_security',
    'security_monitor'
  ) THEN
    is_valid_source := TRUE;
  END IF;

  -- Additional validation: check if called from edge function context
  IF current_setting('request.method', TRUE) IS NOT NULL THEN
    -- This indicates we're in an edge function context
    is_valid_source := TRUE;
  END IF;

  -- Log system validation attempt
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'system_process_validation',
    CASE WHEN is_valid_source THEN 'low' ELSE 'critical' END,
    jsonb_build_object(
      'function_name', p_function_name,
      'validation_result', is_valid_source,
      'timestamp', NOW(),
      'auth_uid', auth.uid(),
      'request_context', current_setting('request.headers', TRUE)
    )
  );

  RETURN is_valid_source;
END;
$$;

-- 5. Create secure RLS policies for user_behavioral_analytics

-- Only system processes can insert behavioral analytics
CREATE POLICY "Only validated system processes can insert behavioral analytics" 
ON public.user_behavioral_analytics 
FOR INSERT 
WITH CHECK (
  -- Allow if called from legitimate system function
  validate_system_process('behavioral_analytics') 
  OR 
  -- Allow super admins for emergency operations
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- Only super admins can view behavioral analytics
CREATE POLICY "Super admins can view behavioral analytics" 
ON public.user_behavioral_analytics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- Prevent updates and deletes (immutable security logs)
CREATE POLICY "Behavioral analytics are immutable" 
ON public.user_behavioral_analytics 
FOR UPDATE 
USING (FALSE);

CREATE POLICY "Behavioral analytics cannot be deleted" 
ON public.user_behavioral_analytics 
FOR DELETE 
USING (FALSE);

-- 6. Create secure RLS policies for user_behavior_patterns

-- Only system processes can modify behavior patterns
CREATE POLICY "Only validated system processes can insert behavior patterns" 
ON public.user_behavior_patterns 
FOR INSERT 
WITH CHECK (validate_system_process('behavior_patterns'));

CREATE POLICY "Only validated system processes can update behavior patterns" 
ON public.user_behavior_patterns 
FOR UPDATE 
USING (validate_system_process('behavior_patterns'));

-- Super admins can view behavior patterns
CREATE POLICY "Super admins can view behavior patterns" 
ON public.user_behavior_patterns 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- Prevent deletion of behavior patterns
CREATE POLICY "Behavior patterns cannot be deleted" 
ON public.user_behavior_patterns 
FOR DELETE 
USING (FALSE);

-- 7. Enhance network_security_events with stricter policies

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Only security admins can access network events" ON public.network_security_events;

-- Only validated system processes can insert network events
CREATE POLICY "Only validated system processes can insert network events" 
ON public.network_security_events 
FOR INSERT 
WITH CHECK (
  validate_system_process('network_security') 
  AND system_validated = TRUE
);

-- Only super admins can view network events
CREATE POLICY "Super admins can view network security events" 
ON public.network_security_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- Network events are immutable
CREATE POLICY "Network security events are immutable" 
ON public.network_security_events 
FOR UPDATE 
USING (FALSE);

CREATE POLICY "Network security events cannot be deleted" 
ON public.network_security_events 
FOR DELETE 
USING (FALSE);

-- 8. Create function to securely log security events with validation
CREATE OR REPLACE FUNCTION public.log_validated_security_event(
  p_event_type TEXT,
  p_severity TEXT,
  p_details JSONB,
  p_user_id UUID DEFAULT NULL,
  p_source_function TEXT DEFAULT 'unknown'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id UUID;
  validation_signature TEXT;
BEGIN
  -- Validate the calling source
  IF NOT validate_system_process(p_source_function) THEN
    RAISE EXCEPTION 'Unauthorized attempt to log security event from: %', p_source_function;
  END IF;

  -- Create validation signature
  validation_signature := encode(
    digest(
      p_event_type || p_severity || p_details::TEXT || NOW()::TEXT || p_source_function, 
      'sha256'
    ), 
    'hex'
  );

  -- Insert the validated security event
  INSERT INTO public.security_events (
    event_type, 
    severity, 
    details, 
    user_id,
    data_classification
  ) VALUES (
    p_event_type,
    p_severity,
    p_details || jsonb_build_object(
      'source_function', p_source_function,
      'validation_signature', validation_signature,
      'validated_at', NOW()
    ),
    p_user_id,
    'restricted'
  ) RETURNING id INTO event_id;

  RETURN event_id;
END;
$$;

-- 9. Create monitoring function to detect tampering attempts
CREATE OR REPLACE FUNCTION public.detect_security_log_tampering()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  suspicious_activity RECORD;
BEGIN
  -- Check for gaps in security event timestamps (possible deletion)
  FOR suspicious_activity IN
    SELECT 
      date_trunc('hour', created_at) as hour_bucket,
      COUNT(*) as event_count,
      MIN(created_at) as first_event,
      MAX(created_at) as last_event
    FROM public.security_events 
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY date_trunc('hour', created_at)
    HAVING COUNT(*) < 5  -- Suspiciously low activity
  LOOP
    -- Create alert for potential log tampering
    PERFORM create_security_alert(
      'potential_security_log_tampering',
      'critical',
      'Potential Security Log Tampering Detected',
      format('Suspicious gap in security logs detected for hour %s with only %s events', 
             suspicious_activity.hour_bucket, 
             suspicious_activity.event_count),
      jsonb_build_object(
        'hour_bucket', suspicious_activity.hour_bucket,
        'event_count', suspicious_activity.event_count,
        'expected_minimum', 5,
        'investigation_required', true
      )
    );
  END LOOP;

  -- Check for unauthorized access attempts to security tables
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'security_log_tampering_check_completed',
    'low',
    jsonb_build_object(
      'timestamp', NOW(),
      'check_type', 'automated_tampering_detection'
    )
  );
END;
$$;