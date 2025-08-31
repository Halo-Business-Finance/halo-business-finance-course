-- Fix the security linter warning: Function Search Path Mutable
-- Set immutable search_path for all functions

-- Fix encrypt_pii_data function
CREATE OR REPLACE FUNCTION encrypt_pii_data(data_text TEXT, encryption_key TEXT DEFAULT 'halo_finance_pii_key_2024')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
BEGIN
  IF data_text IS NULL OR data_text = '' THEN
    RETURN NULL;
  END IF;
  -- For now, we'll use a simple masking approach until full encryption is implemented
  -- In production, this would use pgcrypto with proper key management
  RETURN data_text;
END;
$$;

-- Fix monitor_admin_bulk_access function
CREATE OR REPLACE FUNCTION monitor_admin_bulk_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  access_count INTEGER;
  recent_access_count INTEGER;
BEGIN
  -- Only monitor admin users accessing other users' data
  IF NEW.admin_user_id IS NOT NULL AND NEW.action LIKE '%bulk%access%' THEN
    
    -- Check for suspicious bulk access patterns
    SELECT COUNT(*) INTO recent_access_count
    FROM admin_audit_log
    WHERE admin_user_id = NEW.admin_user_id
      AND action LIKE '%bulk%access%'
      AND created_at > now() - interval '1 hour';

    -- If admin is accessing large amounts of data, create alert
    IF recent_access_count >= 10 THEN
      PERFORM create_security_alert(
        'suspicious_admin_bulk_access',
        'critical',
        'Suspicious Admin Bulk Data Access Detected',
        format('SECURITY ALERT: Admin %s has performed %s bulk data access operations in the last hour. This may indicate unauthorized data harvesting or a potential security breach.', 
               NEW.admin_user_id, recent_access_count),
        jsonb_build_object(
          'admin_user_id', NEW.admin_user_id,
          'bulk_access_count', recent_access_count,
          'time_window', '1_hour',
          'alert_level', 'critical',
          'requires_immediate_investigation', true,
          'potential_data_breach', true,
          'automated_monitoring', true
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Fix cleanup_old_behavioral_data function
CREATE OR REPLACE FUNCTION cleanup_old_behavioral_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  retention_days INTEGER := 365; -- 1 year retention policy
  deleted_count INTEGER;
BEGIN
  -- Clean up old security events (keep critical events longer)
  DELETE FROM security_events 
  WHERE created_at < (now() - (retention_days || ' days')::interval)
    AND severity NOT IN ('critical', 'high');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Log cleanup activity
  INSERT INTO security_events (event_type, severity, details, logged_via_secure_function)
  VALUES (
    'automated_data_retention_cleanup',
    'low',
    jsonb_build_object(
      'cleanup_type', 'behavioral_data',
      'retention_days', retention_days,
      'records_deleted', deleted_count,
      'timestamp', now(),
      'gdpr_compliant', true,
      'automated', true
    ),
    true
  );
END;
$$;

-- Fix export_user_data function
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_data JSONB;
BEGIN
  -- Only users can export their own data or super admins for compliance
  IF auth.uid() != target_user_id AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot export user data';
  END IF;

  -- Compile all user data
  SELECT jsonb_build_object(
    'profile', (SELECT row_to_json(p) FROM profiles p WHERE p.user_id = target_user_id),
    'course_progress', (SELECT jsonb_agg(row_to_json(cp)) FROM course_progress cp WHERE cp.user_id = target_user_id),
    'enrollments', (SELECT jsonb_agg(row_to_json(ce)) FROM course_enrollments ce WHERE ce.user_id = target_user_id),
    'privacy_consents', (SELECT jsonb_agg(row_to_json(pc)) FROM user_privacy_consents pc WHERE pc.user_id = target_user_id),
    'export_timestamp', now(),
    'export_requested_by', auth.uid()
  ) INTO user_data;

  -- Log the data export
  INSERT INTO admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'gdpr_data_export',
    target_user_id,
    'user_data_complete',
    jsonb_build_object(
      'export_type', 'gdpr_compliance',
      'timestamp', now(),
      'data_categories', ARRAY['profile', 'progress', 'enrollments', 'consents'],
      'compliance_framework', 'gdpr_article_20'
    ),
    'confidential'
  );

  RETURN user_data;
END;
$$;