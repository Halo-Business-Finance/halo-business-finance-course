-- Complete fix for infinite recursion in user_roles policies
-- Drop all existing policies on user_roles
DROP POLICY IF EXISTS "Users can view their own role records" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their roles" ON public.user_roles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own roles simple" 
ON public.user_roles 
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage all roles" 
ON public.user_roles 
FOR ALL
USING (current_setting('request.jwt.role', true) = 'service_role');

-- Add policy for super admin management (using a direct approach)
CREATE POLICY "Direct super admin access" 
ON public.user_roles 
FOR ALL
USING (
  auth.uid() IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'super_admin' 
    AND ur.is_active = true 
    AND ur.user_id = auth.uid()
  )
);

-- Fix other policies that might cause recursion issues
-- Update AI threat analyses policy to use simpler check
DROP POLICY IF EXISTS "Admins can manage AI threat analyses" ON public.ai_threat_analyses;
CREATE POLICY "Simple admin access for AI threat analyses" 
ON public.ai_threat_analyses 
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'super_admin', 'tech_support_admin') 
    AND is_active = true
  )
);

-- Update security alerts policy similarly
DROP POLICY IF EXISTS "Admins can manage security alerts" ON public.security_alerts;
CREATE POLICY "Simple admin access for security alerts" 
ON public.security_alerts 
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'super_admin', 'tech_support_admin') 
    AND is_active = true
  )
);

-- Update behavioral analytics policy
DROP POLICY IF EXISTS "Users can view their own behavioral analytics" ON public.user_behavioral_analytics;
CREATE POLICY "Simple behavioral analytics access" 
ON public.user_behavioral_analytics 
FOR SELECT
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'super_admin', 'tech_support_admin') 
    AND is_active = true
  )
);

-- Update threat intelligence patterns policy
DROP POLICY IF EXISTS "Admins can manage threat intelligence patterns" ON public.threat_intelligence_patterns;
CREATE POLICY "Simple admin access for threat patterns" 
ON public.threat_intelligence_patterns 
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'super_admin', 'tech_support_admin') 
    AND is_active = true
  )
);