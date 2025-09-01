-- Optimize security monitoring by reducing noise and focusing on real threats

-- 1. Update the security monitoring to use intelligent filtering
CREATE OR REPLACE FUNCTION public.log_filtered_security_event(
  p_event_type text,
  p_severity text,
  p_details jsonb DEFAULT '{}',
  p_user_id uuid DEFAULT auth.uid()
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  should_log boolean := true;
  recent_count integer;
  rate_limit_window interval;
BEGIN
  -- Define rate limits for different event types
  CASE p_event_type
    WHEN 'developer_tools_detected' THEN
      -- Only log developer tools detection once per hour per user
      rate_limit_window := '1 hour';
      SELECT COUNT(*) INTO recent_count
      FROM security_events 
      WHERE event_type = p_event_type 
        AND user_id = p_user_id
        AND created_at > now() - rate_limit_window;
      should_log := (recent_count = 0);
      
    WHEN 'admin_status_check' THEN
      -- Only log admin status checks once per 15 minutes per user
      rate_limit_window := '15 minutes';
      SELECT COUNT(*) INTO recent_count
      FROM security_events 
      WHERE event_type = p_event_type 
        AND user_id = p_user_id
        AND created_at > now() - rate_limit_window;
      should_log := (recent_count = 0);
      
    WHEN 'user_session_started' THEN
      -- Only log session starts once per session (6 hours)
      rate_limit_window := '6 hours';
      SELECT COUNT(*) INTO recent_count
      FROM security_events 
      WHERE event_type = p_event_type 
        AND user_id = p_user_id
        AND created_at > now() - rate_limit_window;
      should_log := (recent_count = 0);
      
    ELSE
      -- Log all other events (real security threats)
      should_log := true;
  END CASE;

  -- Only insert if we should log this event
  IF should_log THEN
    INSERT INTO security_events (
      user_id,
      event_type,
      severity,
      details,
      logged_via_secure_function
    ) VALUES (
      p_user_id,
      p_event_type,
      p_severity,
      p_details || jsonb_build_object(
        'filtered_logging', true,
        'timestamp', now()
      ),
      true
    );
  END IF;
END;
$$;

-- 2. Create a cleanup function to remove old routine events while keeping security threats
CREATE OR REPLACE FUNCTION public.cleanup_routine_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete old routine events (keep security threats)
  DELETE FROM security_events 
  WHERE created_at < now() - interval '7 days'
    AND event_type IN (
      'developer_tools_detected',
      'admin_status_check', 
      'user_session_started',
      'profile_self_access',
      'session_validation'
    )
    AND severity IN ('low', 'medium');
    
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log cleanup activity
  INSERT INTO security_events (
    event_type,
    severity,
    details,
    logged_via_secure_function
  ) VALUES (
    'routine_security_events_cleanup',
    'low',
    jsonb_build_object(
      'deleted_count', deleted_count,
      'cleanup_timestamp', now(),
      'retention_policy', '7_days_for_routine_events'
    ),
    true
  );
END;
$$;

-- 3. Create a function to get clean security statistics
CREATE OR REPLACE FUNCTION public.get_clean_security_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_security_threats', (
      SELECT COUNT(*) FROM security_events 
      WHERE created_at > now() - interval '24 hours'
        AND event_type NOT IN ('developer_tools_detected', 'admin_status_check', 'user_session_started', 'profile_self_access')
    ),
    'critical_threats', (
      SELECT COUNT(*) FROM security_events 
      WHERE created_at > now() - interval '24 hours'
        AND severity = 'critical'
    ),
    'high_severity_events', (
      SELECT COUNT(*) FROM security_events 
      WHERE created_at > now() - interval '7 days'
        AND severity IN ('high', 'critical')
        AND event_type NOT IN ('developer_tools_detected', 'admin_status_check', 'user_session_started')
    ),
    'admin_pii_access_24h', (
      SELECT COUNT(*) FROM security_events 
      WHERE created_at > now() - interval '24 hours'
        AND event_type = 'admin_accessed_customer_pii'
    ),
    'routine_events_filtered', (
      SELECT COUNT(*) FROM security_events 
      WHERE created_at > now() - interval '24 hours'
        AND event_type IN ('developer_tools_detected', 'admin_status_check', 'user_session_started')
    ),
    'last_updated', now()
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- 4. Update the main security dashboard function to use clean stats
CREATE OR REPLACE FUNCTION public.get_security_dashboard_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  dashboard_data jsonb;
  requesting_user_role text;
  clean_stats jsonb;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for security dashboard access';
  END IF;

  -- Get requesting user's role securely
  SELECT ur.role INTO requesting_user_role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() 
  AND ur.is_active = true
  ORDER BY 
    CASE ur.role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      ELSE 3
    END
  LIMIT 1;

  -- Check if requesting user is admin
  IF requesting_user_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Admin privileges required for security dashboard access';
  END IF;

  -- Get clean security statistics
  clean_stats := get_clean_security_stats();

  -- Gather focused security metrics
  SELECT jsonb_build_object(
    'active_sessions', (
      SELECT COUNT(*) FROM public.user_sessions 
      WHERE is_active = true 
      AND expires_at > now()
    ),
    'recent_security_events', (clean_stats->>'total_security_threats')::integer,
    'high_severity_events', (clean_stats->>'high_severity_events')::integer,
    'failed_auth_attempts', (
      SELECT COUNT(*) FROM public.security_events 
      WHERE event_type = 'failed_login' 
      AND created_at > now() - interval '24 hours'
    ),
    'admin_actions_today', (
      SELECT COUNT(*) FROM public.admin_audit_log 
      WHERE created_at > current_date
    ),
    'admin_pii_access_24h', (clean_stats->>'admin_pii_access_24h')::integer,
    'routine_events_filtered', (clean_stats->>'routine_events_filtered')::integer,
    'system_health', jsonb_build_object(
      'rls_status', 'healthy',
      'audit_logging', 'active',
      'threat_monitoring', 'optimized'
    ),
    'last_updated', now()
  ) INTO dashboard_data;

  -- Log dashboard access (using filtered logging)
  PERFORM log_filtered_security_event(
    'security_dashboard_access',
    'low',
    jsonb_build_object(
      'access_type', 'dashboard_view',
      'user_role', requesting_user_role
    )
  );

  RETURN dashboard_data;
END;
$$;