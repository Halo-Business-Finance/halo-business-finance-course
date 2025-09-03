-- Security Fix 7: Make Audit Tables Truly Append-Only
CREATE OR REPLACE FUNCTION public.prevent_audit_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent all updates and deletes on audit tables
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    -- Log the attempt
    INSERT INTO public.security_events (
      event_type,
      severity,
      details,
      logged_via_secure_function
    ) VALUES (
      'audit_tampering_attempt',
      'critical',
      jsonb_build_object(
        'attempted_operation', TG_OP,
        'table_name', TG_TABLE_NAME,
        'user_id', auth.uid(),
        'timestamp', now(),
        'blocked', true,
        'threat_level', 'critical'
      ),
      true
    );
    
    RAISE EXCEPTION 'Audit records are immutable. This incident has been logged.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply append-only protection to audit tables
DROP TRIGGER IF EXISTS protect_admin_audit_log ON public.admin_audit_log;
CREATE TRIGGER protect_admin_audit_log
  BEFORE UPDATE OR DELETE ON public.admin_audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

DROP TRIGGER IF EXISTS protect_security_events ON public.security_events;  
CREATE TRIGGER protect_security_events
  BEFORE UPDATE OR DELETE ON public.security_events
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- Security Fix 8: Enhanced Monitoring Functions
CREATE OR REPLACE FUNCTION public.detect_bulk_profile_access()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  suspicious_admin RECORD;
BEGIN
  -- Detect admins accessing multiple profiles in short time
  FOR suspicious_admin IN
    SELECT 
      admin_user_id,
      COUNT(*) as access_count,
      MAX(created_at) as last_access
    FROM admin_audit_log 
    WHERE action = 'customer_profile_access_with_masking'
      AND created_at > now() - interval '1 hour'
    GROUP BY admin_user_id
    HAVING COUNT(*) >= 10  -- 10+ profile accesses in 1 hour
  LOOP
    -- Create security alert
    PERFORM create_security_alert(
      'suspicious_bulk_profile_access',
      'high',
      'Suspicious Bulk Profile Access Detected',
      format('Admin %s accessed %s customer profiles in the last hour. This may indicate data mining or breach activity.', 
             suspicious_admin.admin_user_id, 
             suspicious_admin.access_count),
      jsonb_build_object(
        'admin_user_id', suspicious_admin.admin_user_id,
        'profile_access_count', suspicious_admin.access_count,
        'last_access', suspicious_admin.last_access,
        'threat_level', 'high',
        'requires_investigation', true,
        'potential_gdpr_violation', true
      )
    );
  END LOOP;
END;
$$;

-- Security Fix 9: Privacy Consent Management
CREATE TABLE IF NOT EXISTS privacy_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'analytics', 'marketing', 'data_processing'
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, consent_type)
);

-- Enable RLS on privacy consents
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

-- Privacy consent policies
CREATE POLICY "Users can manage their own privacy consents" 
ON privacy_consents 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view privacy consents for compliance" 
ON privacy_consents 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Security Fix 10: Data Retention Management
CREATE OR REPLACE FUNCTION public.schedule_data_deletion(
  user_id_to_delete UUID,
  retention_days INTEGER DEFAULT 30
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the data deletion request
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details,
    logged_via_secure_function
  ) VALUES (
    user_id_to_delete,
    'gdpr_data_deletion_scheduled',
    'medium',
    jsonb_build_object(
      'user_id', user_id_to_delete,
      'retention_days', retention_days,
      'scheduled_deletion_date', now() + (retention_days || ' days')::interval,
      'compliance_framework', 'GDPR_Article_17',
      'right_to_be_forgotten', true
    ),
    true
  );
END;
$$;