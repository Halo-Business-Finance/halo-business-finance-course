-- ULTIMATE FIX: Complete reconstruction of user_roles policies
-- Step 1: Drop ALL policies on user_roles to ensure clean slate
DROP POLICY IF EXISTS "users_can_view_own_roles_only" ON public.user_roles;
DROP POLICY IF EXISTS "service_role_full_access" ON public.user_roles;  
DROP POLICY IF EXISTS "super_admin_can_manage_roles" ON public.user_roles;

-- Step 2: Ensure our security definer functions exist and work correctly
CREATE OR REPLACE FUNCTION public.is_user_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Direct query bypassing RLS completely
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

-- Step 3: Create the simplest possible policies for user_roles
-- Users can only see their own roles
CREATE POLICY "user_own_roles_only" 
ON public.user_roles 
FOR SELECT
USING (auth.uid() = user_id);

-- Service role has full access for system operations
CREATE POLICY "service_role_access" 
ON public.user_roles 
FOR ALL
USING (current_setting('request.jwt.role', true) = 'service_role')
WITH CHECK (current_setting('request.jwt.role', true) = 'service_role');

-- Step 4: Allow role management operations (INSERT/UPDATE/DELETE) only for authenticated service operations
-- This prevents any user-level recursion while allowing system functions to work
CREATE POLICY "system_role_management" 
ON public.user_roles 
FOR ALL
USING (
  -- Allow if it's a service role operation OR if it's during initial setup
  current_setting('request.jwt.role', true) = 'service_role' 
  OR current_setting('application_name', true) = 'setup_initial_admin'
)
WITH CHECK (
  current_setting('request.jwt.role', true) = 'service_role' 
  OR current_setting('application_name', true) = 'setup_initial_admin'
);

-- Step 5: Update security_events table to use the security definer function
DROP POLICY IF EXISTS "Admins can view all events" ON public.security_events;
CREATE POLICY "admin_view_security_events" 
ON public.security_events 
FOR SELECT
USING (public.is_user_admin());

-- Step 6: Ensure system can create security events without user context
DROP POLICY IF EXISTS "System can create events" ON public.security_events;
CREATE POLICY "system_create_security_events" 
ON public.security_events 
FOR INSERT
WITH CHECK (true); -- Allow all inserts for system logging

-- Step 7: Users can view their own security events
DROP POLICY IF EXISTS "Users can view own events" ON public.security_events;
CREATE POLICY "user_own_security_events" 
ON public.security_events 
FOR SELECT
USING (auth.uid() = user_id);