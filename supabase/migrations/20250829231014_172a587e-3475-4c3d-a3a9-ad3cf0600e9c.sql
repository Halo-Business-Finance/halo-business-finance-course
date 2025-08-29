-- Phase 1: Critical PII Protection & Enhanced Security

-- Create enhanced profile access function with strict PII masking
CREATE OR REPLACE FUNCTION public.get_secured_admin_profiles(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_search_term TEXT DEFAULT NULL
)
RETURNS TABLE(
  user_id UUID,
  masked_name TEXT,
  masked_email TEXT, 
  masked_phone TEXT,
  location TEXT,
  company TEXT,
  join_date TIMESTAMP WITH TIME ZONE,
  user_role TEXT,
  last_activity TIMESTAMP WITH TIME ZONE,
  total_records BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requesting_user_role TEXT;
  total_count BIGINT;
BEGIN
  -- Verify admin access
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Get requesting user's role for audit logging
  requesting_user_role := get_user_role_secure();
  
  -- Get total count for pagination
  SELECT COUNT(*)
  INTO total_count
  FROM public.profiles p
  WHERE (p_search_term IS NULL OR 
         p.name ILIKE '%' || p_search_term || '%' OR 
         p.email ILIKE '%' || p_search_term || '%' OR
         p.company ILIKE '%' || p_search_term || '%');
  
  -- Log admin access to customer data
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'bulk_customer_profiles_access',
    'profiles_masked_view',
    jsonb_build_object(
      'access_type', 'paginated_profile_list',
      'limit', p_limit,
      'offset', p_offset,
      'search_term', COALESCE(p_search_term, 'none'),
      'requesting_role', requesting_user_role,
      'timestamp', now(),
      'data_classification', 'confidential_masked'
    ),
    'confidential'
  );
  
  -- Return masked profile data
  RETURN QUERY
  SELECT 
    p.user_id,
    -- Always mask PII data for admin view
    mask_sensitive_data(p.name, 'name', requesting_user_role) as masked_name,
    mask_sensitive_data(p.email, 'email', requesting_user_role) as masked_email,
    mask_sensitive_data(p.phone, 'phone', requesting_user_role) as masked_phone,
    p.location,
    p.company,
    p.join_date,
    COALESCE(ur.role, 'user') as user_role,
    COALESCE(ls.last_activity_at, p.created_at) as last_activity,
    total_count
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
  LEFT JOIN public.learning_stats ls ON p.user_id = ls.user_id
  WHERE (p_search_term IS NULL OR 
         p.name ILIKE '%' || p_search_term || '%' OR 
         p.email ILIKE '%' || p_search_term || '%' OR
         p.company ILIKE '%' || p_search_term || '%')
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Enhanced lead data security function
CREATE OR REPLACE FUNCTION public.get_secured_leads_data(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_status_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  masked_first_name TEXT,
  masked_last_name TEXT,
  masked_email TEXT,
  masked_phone TEXT,
  company TEXT,
  status TEXT,
  lead_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  total_records BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requesting_user_role TEXT;
  total_count BIGINT;
BEGIN
  -- Only super admins can access lead data
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required for lead data';
  END IF;
  
  requesting_user_role := get_user_role_secure();
  
  -- Get total count
  SELECT COUNT(*)
  INTO total_count
  FROM public.leads l
  WHERE (p_status_filter IS NULL OR l.status = p_status_filter);
  
  -- Log lead data access
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'business_leads_data_access',
    'leads_table',
    jsonb_build_object(
      'access_type', 'paginated_leads_view',
      'limit', p_limit,
      'offset', p_offset,
      'status_filter', COALESCE(p_status_filter, 'all'),
      'requesting_role', requesting_user_role,
      'timestamp', now(),
      'compliance_note', 'business_lead_pii_access'
    ),
    'confidential'
  );
  
  -- Return masked lead data
  RETURN QUERY
  SELECT 
    l.id,
    mask_sensitive_data(l.first_name, 'name', requesting_user_role) as masked_first_name,
    mask_sensitive_data(l.last_name, 'name', requesting_user_role) as masked_last_name,
    mask_sensitive_data(l.email, 'email', requesting_user_role) as masked_email,
    mask_sensitive_data(l.phone, 'phone', requesting_user_role) as masked_phone,
    l.company,
    l.status,
    l.lead_source,
    l.created_at,
    l.admin_notes,
    total_count
  FROM public.leads l
  WHERE (p_status_filter IS NULL OR l.status = p_status_filter)
  ORDER BY l.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Enhanced security monitoring function
CREATE OR REPLACE FUNCTION public.monitor_profile_access_patterns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  suspicious_admin RECORD;
BEGIN
  -- Detect admins accessing too many customer profiles
  FOR suspicious_admin IN
    SELECT 
      admin_user_id,
      COUNT(DISTINCT target_user_id) as customers_accessed,
      COUNT(*) as total_operations,
      MIN(created_at) as activity_start,
      MAX(created_at) as activity_end
    FROM admin_audit_log 
    WHERE action IN ('profile_customer_data_access', 'profile_sensitive_data_view', 'customer_pii_access_granted')
      AND created_at > now() - interval '1 hour'
    GROUP BY admin_user_id
    HAVING COUNT(DISTINCT target_user_id) >= 10  -- 10+ customers in 1 hour = flag
  LOOP
    -- Create security alert
    PERFORM create_security_alert(
      'excessive_customer_data_access',
      'high',
      'Excessive Customer Data Access Detected',
      format('Admin %s accessed %s customer profiles in the last hour (%s total operations). This pattern may indicate data scraping or unauthorized bulk access.',
             suspicious_admin.admin_user_id,
             suspicious_admin.customers_accessed,
             suspicious_admin.total_operations),
      jsonb_build_object(
        'admin_user_id', suspicious_admin.admin_user_id,
        'customers_accessed', suspicious_admin.customers_accessed,
        'total_operations', suspicious_admin.total_operations,
        'time_window', '1_hour',
        'activity_duration_minutes', EXTRACT(EPOCH FROM (suspicious_admin.activity_end - suspicious_admin.activity_start))/60,
        'alert_level', 'high',
        'requires_investigation', true,
        'potential_compliance_issue', true
      )
    );
  END LOOP;
  
  -- Log monitoring completion
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'profile_access_pattern_monitoring_completed',
    'low',
    jsonb_build_object(
      'timestamp', now(),
      'monitoring_type', 'customer_profile_access_patterns',
      'status', 'completed'
    )
  );
END;
$$;

-- Function to detect unusual profile access
CREATE OR REPLACE FUNCTION public.detect_unusual_profile_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  unusual_access RECORD;
BEGIN
  -- Detect off-hours admin access to customer data
  FOR unusual_access IN
    SELECT 
      admin_user_id,
      COUNT(*) as access_count,
      MIN(created_at) as first_access,
      MAX(created_at) as last_access
    FROM admin_audit_log 
    WHERE action LIKE '%customer%' OR action LIKE '%profile%'
      AND created_at > now() - interval '24 hours'
      AND (EXTRACT(hour FROM created_at) < 6 OR EXTRACT(hour FROM created_at) > 22) -- Outside 6 AM - 10 PM
    GROUP BY admin_user_id
    HAVING COUNT(*) >= 5  -- 5+ off-hours accesses
  LOOP
    -- Create security alert for off-hours access
    PERFORM create_security_alert(
      'off_hours_customer_data_access',
      'medium',
      'Off-Hours Customer Data Access',
      format('Admin %s accessed customer data %s times outside normal business hours (6 AM - 10 PM) in the last 24 hours.',
             unusual_access.admin_user_id,
             unusual_access.access_count),
      jsonb_build_object(
        'admin_user_id', unusual_access.admin_user_id,
        'access_count', unusual_access.access_count,
        'first_access', unusual_access.first_access,
        'last_access', unusual_access.last_access,
        'requires_review', true
      )
    );
  END LOOP;
END;
$$;

-- Create comprehensive security analysis function
CREATE OR REPLACE FUNCTION public.run_comprehensive_security_analysis()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Run existing security analysis
  PERFORM analyze_security_events();
  
  -- Run new profile access analysis
  PERFORM detect_unusual_profile_access();
  
  -- Run potential data breach detection
  PERFORM detect_potential_data_breach();
  
  -- Log that analysis was run
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'comprehensive_security_analysis_completed',
    'low',
    jsonb_build_object(
      'timestamp', now(),
      'analysis_modules', ARRAY[
        'security_events_analysis',
        'unusual_profile_access_detection', 
        'data_breach_detection'
      ],
      'triggered_by', 'periodic_security_monitoring'
    )
  );
END;
$$;