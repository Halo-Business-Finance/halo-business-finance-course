-- Fix RLS policies for admin access to profiles and user roles

-- Create a simpler admin access policy for profiles that doesn't require the complex validation
CREATE POLICY "Admins can view all profiles for management" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  )
);

-- Ensure admins can view all user roles
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    -- Users can see their own roles
    user_id = auth.uid() OR
    -- Admins can see all roles
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'super_admin') 
      AND ur.is_active = true
    )
  )
);