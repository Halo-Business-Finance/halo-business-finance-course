-- CRITICAL SECURITY FIX: Enhanced Customer PII Protection
-- This migration implements comprehensive data masking and audit logging for customer data access

-- 1. Enhanced data masking function with role-based access
CREATE OR REPLACE FUNCTION public.get_masked_user_profiles()
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  phone text,
  location text,
  company text,
  role text,
  is_masked boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role text;
  is_super_admin boolean := false;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for profile access';
  END IF;

  -- Get current user role
  SELECT get_user_role() INTO current_user_role;
  
  -- Check if user is super admin
  is_super_admin := (current_user_role = 'super_admin');

  -- Log the profile access attempt with detailed metadata
  PERFORM log_admin_profile_access_detailed(
    NULL, -- target_user_id (null for bulk access)
    'bulk_profile_access',
    ARRAY['name', 'email', 'phone', 'location', 'company'],
    'Administrative profile review'
  );

  -- Return profiles with appropriate masking
  RETURN QUERY
  SELECT 
    p.user_id,
    CASE 
      WHEN is_super_admin THEN p.name
      ELSE mask_sensitive_data(p.name, 'name', current_user_role)
    END as name,
    CASE 
      WHEN is_super_admin THEN p.email
      ELSE mask_sensitive_data(p.email, 'email', current_user_role)
    END as email,
    CASE 
      WHEN is_super_admin THEN p.phone
      ELSE mask_sensitive_data(p.phone, 'phone', current_user_role)
    END as phone,
    CASE 
      WHEN is_super_admin THEN p.location
      ELSE mask_sensitive_data(p.location, 'text', current_user_role)
    END as location,
    CASE 
      WHEN is_super_admin THEN p.company
      ELSE mask_sensitive_data(p.company, 'text', current_user_role)
    END as company,
    COALESCE(ur.role, 'user') as role,
    NOT is_super_admin as is_masked
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
  WHERE secure_profile_access(p.user_id) = true
  ORDER BY p.name;
END;
$$;

-- 2. Enhanced lead data protection with role-based access
CREATE OR REPLACE FUNCTION public.get_secure_leads(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_status text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  company text,
  status text,
  created_at timestamp with time zone,
  is_masked boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role text;
  is_super_admin boolean := false;
  can_access_leads boolean := false;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for lead access';
  END IF;

  -- Get current user role
  SELECT get_user_role() INTO current_user_role;
  
  -- Check access permissions
  is_super_admin := (current_user_role = 'super_admin');
  can_access_leads := (current_user_role IN ('super_admin', 'admin', 'sales_admin'));

  IF NOT can_access_leads THEN
    RAISE EXCEPTION 'Insufficient permissions to access lead data';
  END IF;

  -- Log lead data access
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'lead_data_access',
    'leads_table',
    jsonb_build_object(
      'access_type', 'bulk_lead_access',
      'timestamp', now(),
      'limit', p_limit,
      'offset', p_offset,
      'status_filter', p_status,
      'user_role', current_user_role,
      'data_masked', NOT is_super_admin
    ),
    'confidential'
  );

  -- Return leads with appropriate masking
  RETURN QUERY
  SELECT 
    l.id,
    CASE 
      WHEN is_super_admin THEN l.first_name
      ELSE mask_sensitive_data(l.first_name, 'name', current_user_role)
    END as first_name,
    CASE 
      WHEN is_super_admin THEN l.last_name
      ELSE mask_sensitive_data(l.last_name, 'name', current_user_role)
    END as last_name,
    CASE 
      WHEN is_super_admin THEN l.email
      ELSE mask_sensitive_data(l.email, 'email', current_user_role)
    END as email,
    CASE 
      WHEN is_super_admin THEN l.phone
      ELSE mask_sensitive_data(l.phone, 'phone', current_user_role)
    END as phone,
    CASE 
      WHEN is_super_admin THEN l.company
      ELSE mask_sensitive_data(l.company, 'text', current_user_role)
    END as company,
    l.status,
    l.created_at,
    NOT is_super_admin as is_masked
  FROM public.leads l
  WHERE (p_status IS NULL OR l.status = p_status)
  ORDER BY l.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 3. Enhanced security monitoring function
CREATE OR REPLACE FUNCTION public.monitor_profile_access_patterns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  suspicious_admin RECORD;
BEGIN
  -- Detect admins accessing unusually high numbers of customer profiles
  FOR suspicious_admin IN
    SELECT 
      admin_user_id,
      COUNT(DISTINCT target_user_id) as profiles_accessed,
      COUNT(*) as total_operations,
      MIN(created_at) as first_access,
      MAX(created_at) as last_access
    FROM admin_audit_log 
    WHERE action IN ('profile_customer_data_access', 'detailed_profile_pii_access')
      AND created_at > now() - interval '24 hours'
    GROUP BY admin_user_id
    HAVING COUNT(DISTINCT target_user_id) >= 10  -- Flag if accessing 10+ profiles in 24h
  LOOP
    -- Create security alert for unusual access patterns
    PERFORM create_security_alert(
      'unusual_customer_data_access_pattern',
      'high',
      'Unusual Customer Data Access Pattern Detected',
      format('Admin %s accessed %s customer profiles in the last 24 hours with %s total operations. This pattern requires review.', 
             suspicious_admin.admin_user_id, 
             suspicious_admin.profiles_accessed,
             suspicious_admin.total_operations),
      jsonb_build_object(
        'admin_user_id', suspicious_admin.admin_user_id,
        'profiles_accessed', suspicious_admin.profiles_accessed,
        'total_operations', suspicious_admin.total_operations,
        'time_span_hours', 24,
        'first_access', suspicious_admin.first_access,
        'last_access', suspicious_admin.last_access,
        'requires_review', true,
        'alert_type', 'access_pattern_anomaly'
      )
    );
  END LOOP;
END;
$$;

-- 4. Enhanced function to detect unusual profile access
CREATE OR REPLACE FUNCTION public.detect_unusual_profile_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rapid_access RECORD;
BEGIN
  -- Detect rapid sequential customer data access (potential data scraping)
  FOR rapid_access IN
    SELECT 
      admin_user_id,
      COUNT(*) as access_count,
      MIN(created_at) as start_time,
      MAX(created_at) as end_time,
      EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))/60 as duration_minutes
    FROM admin_audit_log 
    WHERE action = 'profile_customer_data_access'
      AND created_at > now() - interval '1 hour'
    GROUP BY admin_user_id
    HAVING COUNT(*) >= 20  -- 20+ accesses in an hour
    AND EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))/60 <= 60  -- Within 1 hour
  LOOP
    -- Create critical security alert for potential data scraping
    PERFORM create_security_alert(
      'potential_customer_data_scraping',
      'critical',
      'CRITICAL: Potential Customer Data Scraping Detected',
      format('SECURITY BREACH ALERT: Admin %s accessed customer data %s times in %s minutes. This rapid access pattern indicates potential unauthorized data scraping or breach.', 
             rapid_access.admin_user_id, 
             rapid_access.access_count,
             ROUND(rapid_access.duration_minutes::numeric, 2)),
      jsonb_build_object(
        'admin_user_id', rapid_access.admin_user_id,
        'access_count', rapid_access.access_count,
        'duration_minutes', rapid_access.duration_minutes,
        'start_time', rapid_access.start_time,
        'end_time', rapid_access.end_time,
        'threat_level', 'critical',
        'immediate_action_required', true,
        'potential_breach', true,
        'requires_admin_lockdown', true
      )
    );
  END LOOP;
END;
$$;

-- 5. Create comprehensive security analysis function
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
      'triggered_by', 'manual_security_review'
    )
  );
END;
$$;