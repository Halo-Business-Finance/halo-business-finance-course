-- Fix recursive policy issue in user_roles table
-- Drop the problematic policies and recreate them correctly

-- First, drop all existing policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles; 
DROP POLICY IF EXISTS "Only super_admin can modify roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role checks for authenticated users" ON public.user_roles;

-- Create proper policies without recursion
CREATE POLICY "Users can view their own roles directly" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all roles directly" 
ON public.user_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

CREATE POLICY "Super admins can modify roles directly" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);