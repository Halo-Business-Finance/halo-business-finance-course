-- Drop the remaining restrictive policy
DROP POLICY IF EXISTS "security_events_super_admin_only" ON public.security_events;

-- Recreate the proper policies for admin access
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