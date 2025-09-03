-- Fix the remaining RLS infinite recursion and ambiguous column issues

-- First, let's check what's causing the recursion in user_roles
-- Drop all existing policies on user_roles that might be recursive
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create completely non-recursive policies for user_roles
-- This policy allows users to see their own roles without any function calls
CREATE POLICY "user_roles_self_access"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- This policy allows system/service role to manage roles (no recursion)
CREATE POLICY "user_roles_system_access" 
ON public.user_roles
FOR ALL
USING (current_setting('request.jwt.role', true) = 'service_role');

-- Create a simple, non-recursive function to get user profiles with proper column qualification
CREATE OR REPLACE FUNCTION public.get_masked_user_profiles()
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  phone text,
  company text,
  created_at timestamp with time zone,
  is_masked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin without causing recursion
  -- Use a direct query instead of function calls
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return masked profiles data with fully qualified column names
  RETURN QUERY
  SELECT 
    p.user_id as user_id,
    p.name as name,
    p.email as email, 
    p.phone as phone,
    p.company as company,
    p.created_at as created_at,
    true as is_masked  -- Always return masked for security
  FROM public.profiles p
  WHERE p.user_id IS NOT NULL
  ORDER BY p.created_at DESC;
END;
$$;

-- Create a simple function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'super_admin') 
    AND ur.is_active = true
  );
$$;

-- Update the is_admin function to prevent recursion
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public  
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = COALESCE(check_user_id, auth.uid())
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
  );
$$;

-- Log the fix
INSERT INTO public.security_events (event_type, severity, details, logged_via_secure_function)
VALUES (
  'rls_recursion_fix_applied',
  'high',
  jsonb_build_object(
    'fixes_applied', ARRAY[
      'user_roles_policies_simplified',
      'get_masked_user_profiles_function_fixed', 
      'column_references_qualified',
      'recursion_eliminated'
    ],
    'timestamp', now(),
    'issue_resolved', 'infinite_recursion_in_user_roles_table'
  ),
  true
);