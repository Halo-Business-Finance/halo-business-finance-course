-- Fix all remaining functions that need search_path for security
-- Update all SECURITY DEFINER functions to have proper search_path

-- Fix remaining functions
CREATE OR REPLACE FUNCTION public.assign_user_role(p_target_user_id uuid, p_new_role text, p_reason text DEFAULT 'Role assignment'::text, p_mfa_verified boolean DEFAULT false)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Prevent self-assignment of admin roles
  IF p_target_user_id = auth.uid() AND p_new_role IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Cannot assign admin roles to yourself';
  END IF;

  -- Check if caller has appropriate privileges
  IF p_new_role = 'super_admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Only super admins can assign super admin roles';
    END IF;
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Admin privileges required';
    END IF;
  END IF;

  -- Insert or update user role
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (p_target_user_id, p_new_role, true)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET is_active = true, updated_at = now();

  -- Log security event with enhanced details
  INSERT INTO public.security_events (user_id, event_type, severity, details)
  VALUES (auth.uid(), 'role_assigned', 'high', jsonb_build_object(
    'target_user_id', p_target_user_id,
    'assigned_role', p_new_role,
    'reason', p_reason,
    'mfa_verified', p_mfa_verified,
    'timestamp', now()
  ));

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.revoke_user_role(p_target_user_id uuid, p_reason text DEFAULT 'Role revocation'::text, p_mfa_verified boolean DEFAULT false)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Prevent self-revocation of admin roles
  IF p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot revoke your own admin roles';
  END IF;

  -- Check if caller has admin privileges
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Deactivate user roles
  UPDATE public.user_roles 
  SET is_active = false, updated_at = now()
  WHERE user_id = p_target_user_id;

  -- Log security event with enhanced details
  INSERT INTO public.security_events (user_id, event_type, severity, details)
  VALUES (auth.uid(), 'role_revoked', 'critical', jsonb_build_object(
    'target_user_id', p_target_user_id,
    'reason', p_reason,
    'mfa_verified', p_mfa_verified,
    'timestamp', now()
  ));

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_security_alert(p_alert_type text, p_severity text, p_title text, p_description text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO security_alerts (alert_type, severity, title, description, metadata)
  VALUES (p_alert_type, p_severity, p_title, p_description, p_metadata)
  RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_ip_address inet, p_endpoint text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_attempts INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
  is_blocked BOOLEAN;
  time_remaining INTEGER;
BEGIN
  -- Calculate window start
  window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Clean old entries
  DELETE FROM rate_limit_attempts 
  WHERE window_start < (NOW() - (p_window_minutes || ' minutes')::INTERVAL);
  
  -- Get current attempts for this IP and endpoint
  SELECT 
    COALESCE(SUM(attempt_count), 0),
    bool_or(is_blocked)
  INTO current_attempts, is_blocked
  FROM rate_limit_attempts 
  WHERE ip_address = p_ip_address 
    AND endpoint = p_endpoint 
    AND window_start > (NOW() - (p_window_minutes || ' minutes')::INTERVAL);
  
  -- Check if blocked
  IF is_blocked OR current_attempts >= p_max_attempts THEN
    -- Update block status
    UPDATE rate_limit_attempts 
    SET is_blocked = TRUE, updated_at = NOW()
    WHERE ip_address = p_ip_address AND endpoint = p_endpoint;
    
    -- Calculate time remaining
    SELECT EXTRACT(EPOCH FROM (
      MAX(window_start) + (p_window_minutes || ' minutes')::INTERVAL - NOW()
    ))::INTEGER
    INTO time_remaining
    FROM rate_limit_attempts
    WHERE ip_address = p_ip_address AND endpoint = p_endpoint;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'current_attempts', current_attempts,
      'max_attempts', p_max_attempts,
      'time_remaining_seconds', COALESCE(time_remaining, 0),
      'blocked_until', NOW() + (COALESCE(time_remaining, 0) || ' seconds')::INTERVAL
    );
  END IF;
  
  -- Record this attempt
  INSERT INTO rate_limit_attempts (ip_address, endpoint, attempt_count, window_start)
  VALUES (p_ip_address, p_endpoint, 1, NOW())
  ON CONFLICT (ip_address, endpoint) 
  DO UPDATE SET 
    attempt_count = rate_limit_attempts.attempt_count + 1,
    updated_at = NOW();
  
  RETURN jsonb_build_object(
    'allowed', true,
    'current_attempts', current_attempts + 1,
    'max_attempts', p_max_attempts,
    'remaining_attempts', p_max_attempts - current_attempts - 1
  );
END;
$function$;