-- Drop all existing conflicting RLS policies on profiles table
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles for management" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles with strict logging" ON public.profiles;
DROP POLICY IF EXISTS "Users can view only their own profile data" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile data" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile data" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile data" ON public.profiles;

-- Create clean, non-conflicting RLS policies
CREATE POLICY "Users can manage their own profile" ON public.profiles
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));