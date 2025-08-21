-- Fix the view approach by creating a secure function instead
-- Drop the problematic view and create a secure function

DROP VIEW IF EXISTS public.user_session_info;
DROP POLICY IF EXISTS "Users can view their own session info" ON public.user_session_info;
DROP POLICY IF EXISTS "Admins can view session info for security monitoring" ON public.user_session_info;

-- Create secure function to get user's own session info (without session tokens)
CREATE OR REPLACE FUNCTION public.get_user_session_info()
RETURNS TABLE(
  id uuid,
  device_id uuid,
  created_at timestamptz,
  last_activity_at timestamptz,
  expires_at timestamptz,
  is_active boolean,
  session_type text,
  ip_address inet,
  user_agent text,
  geolocation jsonb,
  risk_score integer,
  security_level integer,
  terminated_at timestamptz,
  termination_reason text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    us.id,
    us.device_id,
    us.created_at,
    us.last_activity_at,
    us.expires_at,
    us.is_active,
    us.session_type,
    us.ip_address,
    us.user_agent,
    us.geolocation,
    us.risk_score,
    us.security_level,
    us.terminated_at,
    us.termination_reason
  FROM public.user_sessions us
  WHERE us.user_id = auth.uid()
  AND auth.uid() IS NOT NULL;
$$;

-- Create secure function for admins to view session metadata (still no session tokens)
CREATE OR REPLACE FUNCTION public.get_admin_session_info()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  device_id uuid,
  created_at timestamptz,
  last_activity_at timestamptz,
  expires_at timestamptz,
  is_active boolean,
  session_type text,
  ip_address inet,
  user_agent text,
  geolocation jsonb,
  risk_score integer,
  security_level integer,
  terminated_at timestamptz,
  termination_reason text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    us.id,
    us.user_id,
    us.device_id,
    us.created_at,
    us.last_activity_at,
    us.expires_at,
    us.is_active,
    us.session_type,
    us.ip_address,
    us.user_agent,
    us.geolocation,
    us.risk_score,
    us.security_level,
    us.terminated_at,
    us.termination_reason
  FROM public.user_sessions us
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  )
  AND auth.uid() IS NOT NULL;
$$;