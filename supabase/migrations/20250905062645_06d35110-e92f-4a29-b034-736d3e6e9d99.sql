-- Fix security_events RLS policies to allow proper admin access
-- Check current policies on security_events
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'security_events';

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Only super admins can access security events" ON public.security_events;
DROP POLICY IF EXISTS "System can create security events" ON public.security_events;

-- Create proper policies for security_events
CREATE POLICY "Admins can view security events" 
ON public.security_events 
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'super_admin', 'tech_support_admin') 
      AND ur.is_active = true
    )
  )
);

CREATE POLICY "System can insert security events" 
ON public.security_events 
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Super admins can manage security events" 
ON public.security_events 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
  )  
);