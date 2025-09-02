-- Fix RLS policy recursion using security definer functions
-- Create a security definer function to check admin status without recursion

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role_secure(check_user_id uuid, check_role text)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = check_user_id 
    AND role = check_role 
    AND is_active = true
  );
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles; 
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only super admins can manage user roles" ON public.user_roles;

-- Create non-recursive RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (has_role_secure(auth.uid(), 'super_admin'));