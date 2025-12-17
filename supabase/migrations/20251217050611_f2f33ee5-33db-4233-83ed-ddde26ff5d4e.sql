-- Fix security_events table INSERT policy to prevent log injection attacks
-- Drop existing overly permissive INSERT policies

DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;
DROP POLICY IF EXISTS "Allow system to insert security events" ON public.security_events;
DROP POLICY IF EXISTS "service_insert_security_events" ON public.security_events;

-- Create secure INSERT policy that only allows:
-- 1. Service role (edge functions using service key)
-- 2. Super admins
CREATE POLICY "Secure security event insert" ON public.security_events
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow service role (edge functions)
  current_setting('request.jwt.role', true) = 'service_role'
  OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  )
);

-- Ensure UPDATE and DELETE are restricted to prevent log tampering
DROP POLICY IF EXISTS "Admins can update security events" ON public.security_events;
DROP POLICY IF EXISTS "Admins can delete security events" ON public.security_events;

-- Only super admins can update (for resolving events)
CREATE POLICY "Super admins can update security events" ON public.security_events
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  )
);

-- Prevent deletion of security events (immutable audit trail)
-- No DELETE policy means no one can delete via client