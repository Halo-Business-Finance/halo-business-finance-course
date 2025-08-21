-- Update existing functions without dropping them to avoid dependency issues

-- Just update the is_admin function without dropping it
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = COALESCE(check_user_id, auth.uid())
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  );
$$;

-- Update the get_user_role function without dropping it
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = COALESCE(check_user_id, auth.uid())
  AND is_active = true 
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      ELSE 3
    END
  LIMIT 1;
$$;

-- Update the revoke_user_role function with enhanced security
CREATE OR REPLACE FUNCTION public.revoke_user_role(
  p_target_user_id uuid, 
  p_reason text DEFAULT 'Role revocation'::text, 
  p_mfa_verified boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Create a secure function for checking multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(roles text[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(roles)
    AND is_active = true
  );
$$;

-- Create function for logging failed authentication attempts
CREATE OR REPLACE FUNCTION public.log_auth_failure(
  failure_reason text,
  user_email text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_events (user_id, event_type, severity, details)
  VALUES (auth.uid(), 'failed_login', 'medium', jsonb_build_object(
    'failure_reason', failure_reason,
    'user_email', user_email,
    'timestamp', now(),
    'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
  ));
END;
$$;