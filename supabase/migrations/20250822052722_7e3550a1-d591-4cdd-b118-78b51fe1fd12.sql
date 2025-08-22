-- Create immutable audit chain table with enhanced security

-- 1. Create immutable audit chain table for cryptographic integrity
CREATE TABLE IF NOT EXISTS public.immutable_audit_chain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL,
  previous_hash TEXT NOT NULL,
  data_hash TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  chain_position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_classification data_classification DEFAULT 'restricted'
);

-- Enable RLS on audit chain
ALTER TABLE public.immutable_audit_chain ENABLE ROW LEVEL SECURITY;

-- Create unique constraint on chain position
ALTER TABLE public.immutable_audit_chain 
ADD CONSTRAINT unique_chain_position UNIQUE (chain_position);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_audit_chain_position ON public.immutable_audit_chain (chain_position);
CREATE INDEX IF NOT EXISTS idx_audit_chain_entry_id ON public.immutable_audit_chain (entry_id);

-- 2. Create strict RLS policies for audit chain (completely immutable)

-- Only the secure audit logger edge function can insert into audit chain
CREATE POLICY "Only secure audit logger can insert audit chain entries" 
ON public.immutable_audit_chain 
FOR INSERT 
WITH CHECK (
  -- Only allow inserts from edge function context with service role
  current_setting('request.jwt.role', TRUE) = 'service_role'
  AND current_setting('request.headers', TRUE)::json->>'user-agent' LIKE '%edge-runtime%'
);

-- Only super admins can view audit chain for verification
CREATE POLICY "Super admins can view audit chain for verification" 
ON public.immutable_audit_chain 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- Absolutely no updates or deletes allowed (immutable)
CREATE POLICY "Audit chain is completely immutable" 
ON public.immutable_audit_chain 
FOR UPDATE 
USING (FALSE);

CREATE POLICY "Audit chain entries cannot be deleted" 
ON public.immutable_audit_chain 
FOR DELETE 
USING (FALSE);

-- 3. Update existing security tables with enhanced validation

-- Add validation columns to security_events if not exists
ALTER TABLE public.security_events 
ADD COLUMN IF NOT EXISTS validation_signature TEXT,
ADD COLUMN IF NOT EXISTS logged_via_secure_function BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS immutable BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS chain_verified BOOLEAN DEFAULT FALSE;

-- Add validation columns to user_behavioral_analytics if not exists
ALTER TABLE public.user_behavioral_analytics 
ADD COLUMN IF NOT EXISTS validation_hash TEXT,
ADD COLUMN IF NOT EXISTS logged_via_secure_function BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS immutable BOOLEAN DEFAULT FALSE;

-- Add validation columns to user_behavior_patterns if not exists
ALTER TABLE public.user_behavior_patterns 
ADD COLUMN IF NOT EXISTS validation_hash TEXT,
ADD COLUMN IF NOT EXISTS logged_via_secure_function BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS immutable BOOLEAN DEFAULT FALSE;

-- Update network_security_events with additional validation
ALTER TABLE public.network_security_events 
ADD COLUMN IF NOT EXISTS logged_via_secure_function BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS immutable BOOLEAN DEFAULT FALSE;

-- 4. Create enhanced validation functions

-- Function to verify audit chain integrity
CREATE OR REPLACE FUNCTION public.verify_complete_audit_chain()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chain_entry RECORD;
  previous_hash TEXT := '0000000000000000000000000000000000000000000000000000000000000000';
  violation_count INTEGER := 0;
  total_entries INTEGER := 0;
BEGIN
  -- Only super admins can verify the audit chain
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required for audit chain verification';
  END IF;

  -- Iterate through chain entries in order
  FOR chain_entry IN 
    SELECT * FROM public.immutable_audit_chain 
    ORDER BY chain_position ASC
  LOOP
    total_entries := total_entries + 1;
    
    -- Check if previous hash matches
    IF chain_entry.previous_hash != previous_hash THEN
      violation_count := violation_count + 1;
      
      -- Log the violation
      INSERT INTO public.security_events (event_type, severity, details)
      VALUES (
        'audit_chain_integrity_violation',
        'critical',
        jsonb_build_object(
          'position', chain_entry.chain_position,
          'entry_id', chain_entry.entry_id,
          'expected_previous_hash', previous_hash,
          'actual_previous_hash', chain_entry.previous_hash,
          'violation_detected_at', NOW()
        )
      );
    END IF;
    
    previous_hash := chain_entry.data_hash;
  END LOOP;

  -- Log the verification
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'audit_chain_verification',
    'immutable_audit_chain',
    jsonb_build_object(
      'total_entries', total_entries,
      'violations_found', violation_count,
      'verification_timestamp', NOW(),
      'chain_integrity', CASE WHEN violation_count = 0 THEN 'valid' ELSE 'compromised' END
    ),
    'restricted'
  );

  RETURN jsonb_build_object(
    'chain_valid', violation_count = 0,
    'total_entries', total_entries,
    'violations_found', violation_count,
    'last_verified', NOW()
  );
END;
$$;

-- 5. Create function to detect tampering with security data
CREATE OR REPLACE FUNCTION public.detect_security_data_tampering()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  suspicious_pattern RECORD;
  tamper_count INTEGER := 0;
BEGIN
  -- Check for security events without proper validation signatures
  FOR suspicious_pattern IN
    SELECT 
      COUNT(*) as unsigned_events,
      event_type,
      DATE(created_at) as event_date
    FROM public.security_events 
    WHERE validation_signature IS NULL 
      AND created_at > NOW() - INTERVAL '24 hours'
      AND logged_via_secure_function = FALSE
    GROUP BY event_type, DATE(created_at)
    HAVING COUNT(*) > 5
  LOOP
    tamper_count := tamper_count + 1;
    
    -- Create critical alert for potential tampering
    PERFORM create_security_alert(
      'potential_security_data_tampering',
      'critical',
      'Potential Security Data Tampering Detected',
      format('Found %s unsigned security events of type %s on %s', 
             suspicious_pattern.unsigned_events,
             suspicious_pattern.event_type,
             suspicious_pattern.event_date),
      jsonb_build_object(
        'unsigned_events', suspicious_pattern.unsigned_events,
        'event_type', suspicious_pattern.event_type,
        'event_date', suspicious_pattern.event_date,
        'investigation_required', true
      )
    );
  END LOOP;

  -- Check for behavioral analytics without validation hashes
  SELECT COUNT(*) INTO tamper_count
  FROM public.user_behavioral_analytics 
  WHERE validation_hash IS NULL 
    AND created_at > NOW() - INTERVAL '24 hours'
    AND logged_via_secure_function = FALSE;

  IF tamper_count > 0 THEN
    PERFORM create_security_alert(
      'unsigned_behavioral_analytics_detected',
      'high',
      'Unsigned Behavioral Analytics Data Detected',
      format('Found %s behavioral analytics entries without validation hashes', tamper_count),
      jsonb_build_object(
        'unsigned_entries', tamper_count,
        'data_type', 'behavioral_analytics',
        'requires_investigation', true
      )
    );
  END IF;

  -- Log the tampering detection run
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'security_data_tampering_check_completed',
    'low',
    jsonb_build_object(
      'timestamp', NOW(),
      'check_type', 'comprehensive_tampering_detection',
      'patterns_detected', tamper_count
    )
  );
END;
$$;

-- 6. Create secure validation trigger for all security data modifications
CREATE OR REPLACE FUNCTION public.validate_security_data_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow modifications that come from secure logging
  IF TG_OP = 'INSERT' THEN
    -- For new entries, require they come from secure function or are properly validated
    IF NEW.logged_via_secure_function IS NOT TRUE 
       AND NEW.validation_signature IS NULL 
       AND NEW.validation_hash IS NULL THEN
      
      -- Log suspicious insertion attempt
      INSERT INTO public.security_events (event_type, severity, details)
      VALUES (
        'suspicious_security_data_insertion',
        'critical',
        jsonb_build_object(
          'table_name', TG_TABLE_NAME,
          'timestamp', NOW(),
          'user_id', auth.uid(),
          'blocked_reason', 'missing_security_validation'
        )
      );
      
      RAISE EXCEPTION 'Security data insertion blocked: Missing validation from secure logging function';
    END IF;
  END IF;

  -- Block all updates and deletes for immutable entries
  IF TG_OP IN ('UPDATE', 'DELETE') AND 
     (OLD.immutable IS TRUE OR OLD.logged_via_secure_function IS TRUE) THEN
    
    -- Log tampering attempt
    INSERT INTO public.security_events (event_type, severity, details)
    VALUES (
      'security_data_tampering_attempt',
      'critical',
      jsonb_build_object(
        'operation', TG_OP,
        'table_name', TG_TABLE_NAME,
        'timestamp', NOW(),
        'user_id', auth.uid(),
        'blocked_reason', 'immutable_security_data'
      )
    );
    
    RAISE EXCEPTION 'Security data modification blocked: Immutable security data cannot be modified';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 7. Apply validation triggers to all security tables
DROP TRIGGER IF EXISTS validate_security_events_modification ON public.security_events;
CREATE TRIGGER validate_security_events_modification
  BEFORE INSERT OR UPDATE OR DELETE ON public.security_events
  FOR EACH ROW EXECUTE FUNCTION validate_security_data_modification();

DROP TRIGGER IF EXISTS validate_behavioral_analytics_modification ON public.user_behavioral_analytics;
CREATE TRIGGER validate_behavioral_analytics_modification
  BEFORE INSERT OR UPDATE OR DELETE ON public.user_behavioral_analytics
  FOR EACH ROW EXECUTE FUNCTION validate_security_data_modification();

DROP TRIGGER IF EXISTS validate_behavior_patterns_modification ON public.user_behavior_patterns;
CREATE TRIGGER validate_behavior_patterns_modification
  BEFORE INSERT OR UPDATE OR DELETE ON public.user_behavior_patterns
  FOR EACH ROW EXECUTE FUNCTION validate_security_data_modification();

DROP TRIGGER IF EXISTS validate_network_events_modification ON public.network_security_events;
CREATE TRIGGER validate_network_events_modification
  BEFORE INSERT OR UPDATE OR DELETE ON public.network_security_events
  FOR EACH ROW EXECUTE FUNCTION validate_security_data_modification();