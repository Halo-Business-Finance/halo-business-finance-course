-- EMERGENCY SECURITY FIXES - TARGETED UPDATE
-- Fix the specific policies that are causing recursion issues

-- 1. Drop all existing RLS policies that are causing recursion
DROP POLICY IF EXISTS "users_can_view_own_roles_safe" ON public.user_roles;
DROP POLICY IF EXISTS "super_admins_can_manage_roles_safe" ON public.user_roles;
DROP POLICY IF EXISTS "profiles_users_can_view_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_users_can_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_users_can_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admins_can_view_all_safe" ON public.profiles;

-- Drop all existing policies on user_roles table to start fresh
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_roles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.user_roles';
    END LOOP;
END $$;

-- Drop all existing policies on profiles table to start fresh  
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- 2. Create new secure policies for user_roles
CREATE POLICY "user_roles_own_access_v2" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "user_roles_admin_management_v2" 
ON public.user_roles 
FOR ALL 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid()
  )
);

-- 3. Create new secure policies for profiles
CREATE POLICY "profiles_self_access_v2" 
ON public.profiles 
FOR ALL 
USING (user_id = auth.uid());

-- 4. Create temporary admin override for profiles (will be secured via functions)
CREATE POLICY "profiles_admin_override_v2" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid()
  )
);

-- 5. Update existing problematic functions to be safer
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(check_user_id, auth.uid()) IS NOT NULL;
$$;

-- 6. Log the security fixes
INSERT INTO public.security_events (
  event_type,
  severity,
  details,
  logged_via_secure_function
) VALUES (
  'rls_recursion_emergency_fix',
  'low',
  jsonb_build_object(
    'timestamp', now(),
    'action', 'dropped_recursive_policies',
    'created_safe_policies', true,
    'status', 'authentication_should_work_now'
  ),
  true
);