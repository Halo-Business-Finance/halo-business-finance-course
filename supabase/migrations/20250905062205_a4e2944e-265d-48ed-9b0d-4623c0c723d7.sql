-- Fix infinite recursion by using security definer functions
-- First, ensure we have proper security definer functions
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = check_user_id 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = check_user_id 
    AND role = 'super_admin' 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Drop ALL existing user_roles policies to start fresh
DROP POLICY IF EXISTS "Super admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view user roles" ON public.user_roles;

-- Create simple, non-recursive policies using security definer functions
CREATE POLICY "Super admins full access" 
ON public.user_roles 
FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT
USING (auth.uid() = user_id);

-- Fix profiles policies to use security definer functions too
DROP POLICY IF EXISTS "Users can view their own profile and admins can view all" ON public.profiles;

CREATE POLICY "Profile access policy" 
ON public.profiles 
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.is_admin(auth.uid())
);

-- Update the admin dashboard status check to use a simpler query
-- that doesn't trigger RLS issues