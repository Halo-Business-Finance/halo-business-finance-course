-- Fix infinite recursion in user_roles policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their roles" ON public.user_roles;

-- Create non-recursive policies for user_roles
CREATE POLICY "Users can view their own role records" 
ON public.user_roles 
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles 
FOR ALL
USING (
  auth.uid() IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

-- Ensure realtime is enabled for security tables
ALTER publication supabase_realtime ADD TABLE public.security_alerts;
ALTER publication supabase_realtime ADD TABLE public.ai_threat_analyses;
ALTER publication supabase_realtime ADD TABLE public.user_behavioral_analytics;

-- Set replica identity for realtime updates
ALTER TABLE public.security_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.ai_threat_analyses REPLICA IDENTITY FULL;
ALTER TABLE public.user_behavioral_analytics REPLICA IDENTITY FULL;