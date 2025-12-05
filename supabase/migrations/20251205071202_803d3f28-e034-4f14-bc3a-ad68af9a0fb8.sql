-- =====================================================
-- SECURITY FIX: User Session Data Protection
-- Implements secure access functions and data retention
-- =====================================================

-- 1. Create function to mask IP addresses for privacy
CREATE OR REPLACE FUNCTION public.mask_ip_address(ip inet)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF ip IS NULL THEN
    RETURN NULL;
  END IF;
  -- Mask last two octets for IPv4, show only prefix for IPv6
  IF family(ip) = 4 THEN
    RETURN split_part(host(ip), '.', 1) || '.' || split_part(host(ip), '.', 2) || '.xxx.xxx';
  ELSE
    RETURN split_part(host(ip), ':', 1) || ':' || split_part(host(ip), ':', 2) || ':xxxx:xxxx:xxxx:xxxx:xxxx:xxxx';
  END IF;
END;
$$;

-- 2. Create secure function for users to view their own sessions (with masked data)
CREATE OR REPLACE FUNCTION public.get_user_sessions_secure(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  session_type text,
  masked_ip text,
  device_type text,
  is_active boolean,
  created_at timestamptz,
  last_activity_at timestamptz,
  risk_level text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requesting_user_id uuid;
  v_target_user_id uuid;
BEGIN
  v_requesting_user_id := auth.uid();
  
  -- If no user_id provided, use requesting user's ID
  v_target_user_id := COALESCE(p_user_id, v_requesting_user_id);
  
  -- Users can only view their own sessions unless they're super_admin
  IF v_target_user_id != v_requesting_user_id THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = v_requesting_user_id 
      AND role = 'super_admin' 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Access denied: Cannot view other users sessions';
    END IF;
  END IF;
  
  RETURN QUERY
  SELECT 
    us.id,
    us.session_type,
    mask_ip_address(us.ip_address) as masked_ip,
    CASE 
      WHEN us.user_agent ILIKE '%mobile%' THEN 'Mobile'
      WHEN us.user_agent ILIKE '%tablet%' THEN 'Tablet'
      ELSE 'Desktop'
    END as device_type,
    us.is_active,
    us.created_at,
    us.last_activity_at,
    CASE 
      WHEN us.risk_score >= 70 THEN 'High'
      WHEN us.risk_score >= 40 THEN 'Medium'
      ELSE 'Low'
    END as risk_level
  FROM user_sessions us
  WHERE us.user_id = v_target_user_id
  AND us.is_active = true
  ORDER BY us.last_activity_at DESC;
END;
$$;

-- 3. Create secure function for super admins to view session analytics (aggregated, no PII)
CREATE OR REPLACE FUNCTION public.get_session_analytics_secure()
RETURNS TABLE (
  total_active_sessions bigint,
  avg_risk_score numeric,
  high_risk_sessions bigint,
  sessions_last_24h bigint,
  unique_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only super admins can access analytics
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin required for session analytics';
  END IF;
  
  -- Log the access attempt
  INSERT INTO admin_audit_log (admin_user_id, action, target_resource, details)
  VALUES (auth.uid(), 'view_session_analytics', 'user_sessions', 
    jsonb_build_object('timestamp', now(), 'data_type', 'aggregated_analytics'));
  
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE is_active = true) as total_active_sessions,
    ROUND(AVG(risk_score), 2) as avg_risk_score,
    COUNT(*) FILTER (WHERE risk_score >= 70) as high_risk_sessions,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '24 hours') as sessions_last_24h,
    COUNT(DISTINCT user_id) as unique_users
  FROM user_sessions
  WHERE created_at >= now() - interval '30 days';
END;
$$;

-- 4. Create automatic data retention cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_inactive integer;
  v_deleted_expired integer;
  v_deleted_old integer;
BEGIN
  -- Delete inactive sessions older than 7 days
  WITH deleted AS (
    DELETE FROM user_sessions 
    WHERE is_active = false 
    AND (terminated_at < now() - interval '7 days' OR last_activity_at < now() - interval '7 days')
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_inactive FROM deleted;
  
  -- Delete expired sessions
  WITH deleted AS (
    DELETE FROM user_sessions 
    WHERE expires_at < now()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_expired FROM deleted;
  
  -- Delete very old sessions (over 90 days) regardless of status
  WITH deleted AS (
    DELETE FROM user_sessions 
    WHERE created_at < now() - interval '90 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_old FROM deleted;
  
  -- Log the cleanup
  INSERT INTO security_events (event_type, severity, details, logged_via_secure_function)
  VALUES (
    'automated_session_cleanup',
    'low',
    jsonb_build_object(
      'deleted_inactive', v_deleted_inactive,
      'deleted_expired', v_deleted_expired,
      'deleted_old', v_deleted_old,
      'cleanup_timestamp', now(),
      'gdpr_compliant', true
    ),
    true
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_inactive', v_deleted_inactive,
    'deleted_expired', v_deleted_expired,
    'deleted_old', v_deleted_old,
    'total_deleted', v_deleted_inactive + v_deleted_expired + v_deleted_old
  );
END;
$$;

-- 5. Create function for users to terminate their own sessions
CREATE OR REPLACE FUNCTION public.terminate_user_session(p_session_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_user_id uuid;
BEGIN
  -- Get the session owner
  SELECT user_id INTO v_session_user_id
  FROM user_sessions
  WHERE id = p_session_id;
  
  IF v_session_user_id IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  
  -- Only allow users to terminate their own sessions (or super admins)
  IF v_session_user_id != auth.uid() AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Cannot terminate other users sessions';
  END IF;
  
  -- Terminate the session
  UPDATE user_sessions
  SET 
    is_active = false,
    terminated_at = now(),
    termination_reason = 'user_requested'
  WHERE id = p_session_id;
  
  RETURN true;
END;
$$;

-- 6. Grant execute permissions on secure functions
GRANT EXECUTE ON FUNCTION public.get_user_sessions_secure(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_session_analytics_secure() TO authenticated;
GRANT EXECUTE ON FUNCTION public.terminate_user_session(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_sessions() TO service_role;
GRANT EXECUTE ON FUNCTION public.mask_ip_address(inet) TO authenticated;