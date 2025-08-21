-- Fix RLS policies for user registration
-- Allow users to create their initial viewer role during signup
DROP POLICY IF EXISTS "Role assignment only through secure function" ON public.user_roles;

-- Create a policy that allows new users to get a default viewer role
CREATE POLICY "Allow initial user role creation"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  role = 'viewer'::public.user_role 
  AND user_id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid()
  )
);

-- Update the role update policy to be less restrictive for basic role operations
DROP POLICY IF EXISTS "Role updates only through secure function" ON public.user_roles;

CREATE POLICY "Secure role updates"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  -- Users can update their own non-admin roles
  (auth.uid() = user_id AND role NOT IN ('admin', 'super_admin'))
  OR
  -- Admins can update non-super-admin roles
  (has_role('admin'::public.user_role) AND role != 'super_admin')
  OR
  -- Super admins can update any role
  has_role('super_admin'::public.user_role)
);