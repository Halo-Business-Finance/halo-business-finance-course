-- FINAL FIX: Complete policy reconstruction with new names
-- Step 1: Drop ALL existing policies on user_roles with all possible names
DROP POLICY IF EXISTS "user_own_roles_only" ON public.user_roles;
DROP POLICY IF EXISTS "service_role_access" ON public.user_roles;
DROP POLICY IF EXISTS "system_role_management" ON public.user_roles;
DROP POLICY IF EXISTS "users_can_view_own_roles_only" ON public.user_roles;
DROP POLICY IF EXISTS "service_role_full_access" ON public.user_roles;  
DROP POLICY IF EXISTS "super_admin_can_manage_roles" ON public.user_roles;

-- Step 2: Create completely new, simple, non-recursive policies
CREATE POLICY "view_own_user_roles" 
ON public.user_roles 
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "service_manages_user_roles" 
ON public.user_roles 
FOR ALL
USING (current_setting('request.jwt.role', true) = 'service_role')
WITH CHECK (current_setting('request.jwt.role', true) = 'service_role');

-- Step 3: Fix security_events policies
DROP POLICY IF EXISTS "admin_view_security_events" ON public.security_events;
DROP POLICY IF EXISTS "system_create_security_events" ON public.security_events;
DROP POLICY IF EXISTS "user_own_security_events" ON public.security_events;
DROP POLICY IF EXISTS "Admins can view all events" ON public.security_events;
DROP POLICY IF EXISTS "System can create events" ON public.security_events;
DROP POLICY IF EXISTS "Users can view own events" ON public.security_events;

-- Create new security_events policies
CREATE POLICY "admins_view_security_events" 
ON public.security_events 
FOR SELECT
USING (public.is_user_admin());

CREATE POLICY "allow_security_event_creation" 
ON public.security_events 
FOR INSERT
WITH CHECK (true);

CREATE POLICY "users_view_own_security_events" 
ON public.security_events 
FOR SELECT
USING (auth.uid() = user_id);