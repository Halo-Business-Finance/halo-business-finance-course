-- Fix 2: Improve RLS policies to ensure proper access control and prevent permission errors

-- Update profiles RLS policies to be more explicit and comprehensive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create improved RLS policies for profiles table
CREATE POLICY "Users can view own profile data" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile data" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile data" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Improve admin access policies to be more specific
CREATE POLICY "Admins have comprehensive access to profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND is_active = true
  )
);

-- Add better RLS policies for user_roles table to prevent recursion
DROP POLICY IF EXISTS "Allow role checks for authenticated users" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin') 
    AND ur.is_active = true
  )
);

-- Improve course enrollment policies
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.course_enrollments;

CREATE POLICY "Users can view own enrollments" 
ON public.course_enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own enrollments" 
ON public.course_enrollments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add helpful function to check authentication status safely
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- Add function to safely get current user ID
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid();
$$;