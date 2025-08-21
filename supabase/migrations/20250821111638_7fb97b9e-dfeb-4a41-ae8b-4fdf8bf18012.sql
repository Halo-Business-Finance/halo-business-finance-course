-- Fix critical security vulnerability: Enable RLS on safe_profiles table
-- This prevents unauthorized access to customer personal information

-- Enable Row Level Security on the safe_profiles table
ALTER TABLE public.safe_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own safe profile data
CREATE POLICY "Users can view their own safe profile"
ON public.safe_profiles
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Admins can view all safe profile data for administrative purposes
CREATE POLICY "Admins can view all safe profiles"
ON public.safe_profiles
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

-- Policy 3: Users can update their own safe profile data (if needed)
CREATE POLICY "Users can update their own safe profile"
ON public.safe_profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Only admins can insert safe profile data
CREATE POLICY "Admins can insert safe profiles"
ON public.safe_profiles
FOR INSERT 
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Policy 5: Only admins can delete safe profile data
CREATE POLICY "Admins can delete safe profiles"
ON public.safe_profiles
FOR DELETE 
TO authenticated
USING (is_admin(auth.uid()));