-- NUCLEAR OPTION: Complete RLS reset for affected tables

-- Step 1: Temporarily disable RLS to clear all policies
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events DISABLE ROW LEVEL SECURITY;

-- Step 2: Re-enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Step 3: Create brand new policies with timestamp-based unique names
-- User roles policies (completely non-recursive)
CREATE POLICY "user_role_self_view_20250905_073200" 
ON public.user_roles 
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "service_role_admin_20250905_073201" 
ON public.user_roles 
FOR ALL
USING (current_setting('request.jwt.role', true) = 'service_role')
WITH CHECK (current_setting('request.jwt.role', true) = 'service_role');

-- Security events policies (using security definer functions)
CREATE POLICY "admin_security_view_20250905_073202" 
ON public.security_events 
FOR SELECT
USING (public.is_user_admin());

CREATE POLICY "system_security_create_20250905_073203" 
ON public.security_events 
FOR INSERT
WITH CHECK (true);

CREATE POLICY "user_security_self_view_20250905_073204" 
ON public.security_events 
FOR SELECT
USING (auth.uid() = user_id);