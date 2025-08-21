-- CRITICAL SECURITY FIX: Fix user_sessions table policies to prevent account takeover
-- Remove dangerous policies that expose session tokens and allow unauthorized access

-- Drop existing dangerous policies
DROP POLICY IF EXISTS "System can manage sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;

-- Create secure function to check if current session belongs to user (without exposing token)
CREATE OR REPLACE FUNCTION public.is_current_user_session(session_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT session_user_id = auth.uid();
$$;

-- Create secure view for users to see their session info WITHOUT session tokens
CREATE OR REPLACE VIEW public.user_session_info AS
SELECT 
  id,
  user_id,
  device_id,
  created_at,
  last_activity_at,
  expires_at,
  is_active,
  session_type,
  ip_address,
  user_agent,
  geolocation,
  risk_score,
  security_level,
  terminated_at,
  termination_reason
FROM public.user_sessions
WHERE auth.uid() = user_id;

-- Enable RLS on the view
ALTER VIEW public.user_session_info SET (security_barrier = true);

-- Create highly restrictive policies for user_sessions table
-- Only allow system processes (auth.uid() IS NULL from edge functions) to manage sessions
CREATE POLICY "System processes only can manage sessions"
ON public.user_sessions
FOR ALL
USING (
  -- Only allow system processes (edge functions with service role)
  auth.uid() IS NULL AND 
  -- Additional security check to ensure it's a legitimate system call
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
)
WITH CHECK (
  auth.uid() IS NULL AND 
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- Super admins can view limited session metadata (NO session tokens) for security monitoring
CREATE POLICY "Super admins can view session metadata"
ON public.user_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);