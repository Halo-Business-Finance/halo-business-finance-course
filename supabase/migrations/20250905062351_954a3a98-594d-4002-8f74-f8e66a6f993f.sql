-- Temporarily fix the infinite recursion by creating simpler policies
-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Super admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view user roles" ON public.user_roles;

-- Create simple policies that don't reference user_roles table in the policy itself
CREATE POLICY "Allow authenticated users to view their own roles" 
ON public.user_roles 
FOR SELECT
USING (auth.uid() = user_id);

-- For super admin access, we'll use a different approach
-- Create a policy that allows service_role to manage everything
CREATE POLICY "Service role full access to user roles" 
ON public.user_roles 
FOR ALL
USING (current_setting('request.jwt.role', true) = 'service_role');

-- Fix profiles table policy too
DROP POLICY IF EXISTS "Profile access policy" ON public.profiles;

CREATE POLICY "Users can view own profiles" 
ON public.profiles 
FOR SELECT
USING (auth.uid() = user_id);

-- Allow service role to access profiles for admin functions
CREATE POLICY "Service role can access all profiles" 
ON public.profiles 
FOR ALL
USING (current_setting('request.jwt.role', true) = 'service_role');