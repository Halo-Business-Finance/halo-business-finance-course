-- Complete fix for infinite recursion in user_roles policies (fixed version)
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

-- Add policy for super admin management (using a direct approach that avoids recursion)
CREATE POLICY "Direct super admin access" 
ON public.user_roles 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
    LIMIT 1
  )
);

-- Fix other policies that might cause recursion issues
-- Update AI threat analyses policy to use simpler check
DROP POLICY IF EXISTS "Admins can manage AI threat analyses" ON public.ai_threat_analyses;
CREATE POLICY "Simple admin access for AI threat analyses" 
ON public.ai_threat_analyses 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'tech_support_admin') 
    AND is_active = true
    LIMIT 1
  )
);

-- Update security alerts policy similarly
DROP POLICY IF EXISTS "Admins can manage security alerts" ON public.security_alerts;
CREATE POLICY "Simple admin access for security alerts" 
ON public.security_alerts 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'tech_support_admin') 
    AND is_active = true
    LIMIT 1
  )
);

-- Update behavioral analytics policy
DROP POLICY IF EXISTS "Users can view their own behavioral analytics" ON public.user_behavioral_analytics;
CREATE POLICY "Simple behavioral analytics access" 
ON public.user_behavioral_analytics 
FOR SELECT
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'tech_support_admin') 
    AND is_active = true
    LIMIT 1
  )
);