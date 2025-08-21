-- Fix security definer view warning by creating regular view with proper RLS policy
-- Drop the security definer view and create a regular view

DROP VIEW IF EXISTS public.user_session_info;

-- Create regular view (without SECURITY DEFINER) for users to see their session info
CREATE VIEW public.user_session_info AS
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
FROM public.user_sessions;

-- Enable RLS on the view
ALTER VIEW public.user_session_info ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the view (users can only see their own sessions)
CREATE POLICY "Users can view their own session info"
ON public.user_session_info
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for admins to view session metadata (still no session tokens)
CREATE POLICY "Admins can view session info for security monitoring"
ON public.user_session_info
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  )
);