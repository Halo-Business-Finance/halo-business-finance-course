-- Fix infinite recursion in user_roles RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;

-- Create new secure policies that don't cause recursion
-- Use auth.uid() directly and avoid querying user_roles table in policies

-- Allow users to view their own roles only
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Allow super admins to view all roles using the secure function
CREATE POLICY "Super admins can view all roles" ON public.user_roles
  FOR SELECT USING (
    -- Use the existing secure function that doesn't cause recursion
    EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND au.raw_user_meta_data->>'role' = 'super_admin'
    )
    OR user_id = auth.uid()
  );

-- Allow super admins to manage all user roles
CREATE POLICY "Super admins can manage all roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND au.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Prevent regular users from inserting roles for themselves or others
CREATE POLICY "Prevent self role assignment" ON public.user_roles
  FOR INSERT WITH CHECK (false);

-- Prevent regular users from updating roles
CREATE POLICY "Prevent role updates by non-super-admins" ON public.user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND au.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Prevent regular users from deleting roles
CREATE POLICY "Prevent role deletion by non-super-admins" ON public.user_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND au.raw_user_meta_data->>'role' = 'super_admin'
    )
  );