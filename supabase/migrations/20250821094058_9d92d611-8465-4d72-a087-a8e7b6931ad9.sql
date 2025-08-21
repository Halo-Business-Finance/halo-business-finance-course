-- Fix infinite recursion in user_roles policies
-- The issue is that the policies are trying to query user_roles within user_roles policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Only super admins can view user roles" ON user_roles;
DROP POLICY IF EXISTS "Only super admins can insert user roles" ON user_roles;
DROP POLICY IF EXISTS "Only super admins can update user roles" ON user_roles;
DROP POLICY IF EXISTS "Only super admins can delete user roles" ON user_roles;

-- Create a security definer function to check super admin without recursion
CREATE OR REPLACE FUNCTION public.is_current_user_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  );
$$;

-- Create new non-recursive policies using the security definer function
CREATE POLICY "Super admins can view user roles" ON user_roles
FOR SELECT USING (public.is_current_user_super_admin());

CREATE POLICY "Super admins can insert user roles" ON user_roles
FOR INSERT WITH CHECK (public.is_current_user_super_admin());

CREATE POLICY "Super admins can update user roles" ON user_roles
FOR UPDATE USING (public.is_current_user_super_admin());

CREATE POLICY "Super admins can delete user roles" ON user_roles
FOR DELETE USING (public.is_current_user_super_admin());