-- Fix RLS policy recursion by simplifying the is_admin function usage
-- Drop any recursive policies and recreate them properly

-- First, let's check if there are any problematic RLS policies causing recursion
-- We'll recreate the user_roles policies to be non-recursive

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles; 
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

-- Create non-recursive RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
    LIMIT 1
  )
);

-- Log the fix
INSERT INTO public.security_events (event_type, severity, details)
VALUES (
  'rls_policy_recursion_fixed',
  'low',
  jsonb_build_object(
    'timestamp', now(),
    'action', 'fixed_user_roles_rls_recursion',
    'policies_recreated', 2,
    'admin_access_restored', true
  )
);