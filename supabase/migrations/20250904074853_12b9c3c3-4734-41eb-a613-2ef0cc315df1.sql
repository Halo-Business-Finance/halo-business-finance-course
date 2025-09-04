-- Enhanced Security Monitoring Functions

-- Function to monitor profile access patterns
CREATE OR REPLACE FUNCTION public.monitor_profile_access_patterns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  suspicious_admin RECORD;
BEGIN
  -- Monitor for excessive profile access by admins
  FOR suspicious_admin IN
    SELECT 
      admin_user_id,
      COUNT(DISTINCT target_user_id) as unique_customers_accessed,
      COUNT(*) as total_accesses,
      MIN(created_at) as first_access,
      MAX(created_at) as last_access
    FROM public.admin_audit_log 
    WHERE action LIKE '%customer%'
      AND created_at > now() - interval '2 hours'
    GROUP BY admin_user_id
    HAVING COUNT(DISTINCT target_user_id) >= 10  -- Flag if accessing 10+ customers in 2 hours
  LOOP
    -- Create security alert
    PERFORM create_security_alert(
      'excessive_customer_data_access',
      'high',
      'Excessive Customer Data Access Pattern Detected',
      format('Admin %s accessed %s unique customer profiles in 2 hours (%s total operations)', 
             suspicious_admin.admin_user_id, 
             suspicious_admin.unique_customers_accessed,
             suspicious_admin.total_accesses),
      jsonb_build_object(
        'admin_user_id', suspicious_admin.admin_user_id,
        'customers_accessed', suspicious_admin.unique_customers_accessed,
        'total_operations', suspicious_admin.total_accesses,
        'time_span_hours', 2,
        'requires_investigation', true,
        'potential_data_mining', true
      )
    );
  END LOOP;
END;
$$;

-- Function to detect unusual access patterns
CREATE OR REPLACE FUNCTION public.detect_unusual_profile_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  unusual_pattern RECORD;
BEGIN
  -- Detect after-hours customer data access
  FOR unusual_pattern IN
    SELECT 
      admin_user_id,
      COUNT(*) as after_hours_accesses,
      array_agg(DISTINCT target_user_id) as affected_customers
    FROM public.admin_audit_log 
    WHERE action LIKE '%customer%'
      AND created_at > now() - interval '24 hours'
      AND (
        EXTRACT(hour FROM created_at) < 6 OR 
        EXTRACT(hour FROM created_at) > 22 OR
        EXTRACT(dow FROM created_at) IN (0, 6)  -- Weekend
      )
    GROUP BY admin_user_id
    HAVING COUNT(*) >= 3
  LOOP
    -- Create security alert for after-hours access
    PERFORM create_security_alert(
      'after_hours_customer_access',
      'medium',
      'After-Hours Customer Data Access Detected',
      format('Admin %s accessed customer data %s times during after-hours in last 24h', 
             unusual_pattern.admin_user_id, 
             unusual_pattern.after_hours_accesses),
      jsonb_build_object(
        'admin_user_id', unusual_pattern.admin_user_id,
        'after_hours_count', unusual_pattern.after_hours_accesses,
        'affected_customers', unusual_pattern.affected_customers,
        'requires_justification', true
      )
    );
  END LOOP;
END;
$$;

-- Comprehensive security analysis function
CREATE OR REPLACE FUNCTION public.run_comprehensive_security_analysis()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Run all monitoring functions
  PERFORM monitor_profile_access_patterns();
  PERFORM detect_unusual_profile_access();
  PERFORM detect_potential_data_breach();
  
  -- Log completion
  INSERT INTO public.security_events (event_type, severity, details, logged_via_secure_function)
  VALUES (
    'comprehensive_security_analysis_completed',
    'low',
    jsonb_build_object(
      'timestamp', now(),
      'analysis_modules', ARRAY[
        'profile_access_patterns',
        'unusual_access_detection',
        'data_breach_detection'
      ],
      'status', 'completed'
    ),
    true
  );
END;
$$;