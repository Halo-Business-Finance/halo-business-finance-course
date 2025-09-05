-- COMPLETE POLICY RESET: Remove all recursive policies and create simple ones

-- Step 1: Drop ALL existing policies on user_roles by their exact names
DROP POLICY IF EXISTS "Allow authenticated users to view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role full access to user roles" ON public.user_roles;
DROP POLICY IF EXISTS "service_manages_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_self_access" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_self_view_only" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_super_admin_management" ON public.user_roles;  -- This is the problematic recursive one!
DROP POLICY IF EXISTS "user_roles_system_access" ON public.user_roles;
DROP POLICY IF EXISTS "view_own_user_roles" ON public.user_roles;

-- Step 2: Create completely fresh, simple policies with unique names
-- Policy 1: Users can view only their own roles (no recursion)
CREATE POLICY "simple_user_role_view_2025" 
ON public.user_roles 
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Service role has full access for system operations
CREATE POLICY "simple_service_role_access_2025" 
ON public.user_roles 
FOR ALL
USING (current_setting('request.jwt.role', true) = 'service_role')
WITH CHECK (current_setting('request.jwt.role', true) = 'service_role');

-- Step 3: Completely fix security_events policies too
-- Drop all existing security_events policies
DROP POLICY IF EXISTS "admins_view_security_events" ON public.security_events;
DROP POLICY IF EXISTS "allow_security_event_creation" ON public.security_events;  
DROP POLICY IF EXISTS "users_view_own_security_events" ON public.security_events;
DROP POLICY IF EXISTS "admin_view_security_events" ON public.security_events;
DROP POLICY IF EXISTS "system_create_security_events" ON public.security_events;
DROP POLICY IF EXISTS "user_own_security_events" ON public.security_events;

-- Create new simple security_events policies using the security definer functions
CREATE POLICY "simple_admin_security_events_view_2025" 
ON public.security_events 
FOR SELECT
USING (public.is_user_admin());

CREATE POLICY "simple_system_security_events_create_2025" 
ON public.security_events 
FOR INSERT
WITH CHECK (true);

CREATE POLICY "simple_user_security_events_view_2025" 
ON public.security_events 
FOR SELECT
USING (auth.uid() = user_id);