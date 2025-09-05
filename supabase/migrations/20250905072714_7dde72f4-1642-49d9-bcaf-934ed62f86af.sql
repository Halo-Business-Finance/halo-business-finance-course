-- COMPLETE FIX: Remove ALL recursive policies and use security definer functions
-- Step 1: Drop ALL policies on user_roles to start fresh
DROP POLICY IF EXISTS "Users can view own roles simple" ON public.user_roles;
DROP POLICY IF EXISTS "System can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Direct super admin access" ON public.user_roles;

-- Step 2: Create security definer functions that don't cause recursion
CREATE OR REPLACE FUNCTION public.is_user_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Use a direct query without going through RLS
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'tech_support_admin')
    AND is_active = true
  );
$$;

-- Step 3: Create simple, non-recursive RLS policies
CREATE POLICY "users_can_view_own_roles_only" 
ON public.user_roles 
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "service_role_full_access" 
ON public.user_roles 
FOR ALL
USING (current_setting('request.jwt.role', true) = 'service_role')
WITH CHECK (current_setting('request.jwt.role', true) = 'service_role');

-- Step 4: Allow super admins to manage roles (but use function to avoid recursion)
CREATE POLICY "super_admin_can_manage_roles" 
ON public.user_roles 
FOR ALL
USING (public.is_user_super_admin())
WITH CHECK (public.is_user_super_admin());

-- Step 5: Update other tables to use the new functions
DROP POLICY IF EXISTS "Simple admin access for AI threat analyses" ON public.ai_threat_analyses;
CREATE POLICY "admin_access_ai_threat_analyses" 
ON public.ai_threat_analyses 
FOR ALL
USING (public.is_user_admin());

DROP POLICY IF EXISTS "Simple admin access for security alerts" ON public.security_alerts;
CREATE POLICY "admin_access_security_alerts" 
ON public.security_alerts 
FOR ALL
USING (public.is_user_admin());

DROP POLICY IF EXISTS "Simple behavioral analytics access" ON public.user_behavioral_analytics;
CREATE POLICY "behavioral_analytics_access" 
ON public.user_behavioral_analytics 
FOR SELECT
USING (auth.uid() = user_id OR public.is_user_admin());