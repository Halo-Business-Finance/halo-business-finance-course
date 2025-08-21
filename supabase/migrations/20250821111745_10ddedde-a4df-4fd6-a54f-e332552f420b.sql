-- Fix security vulnerability in safe_profiles table
-- Enable RLS and create appropriate policies to protect customer personal information

-- Enable Row Level Security on safe_profiles
ALTER TABLE public.safe_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own safe profile data
CREATE POLICY "Users can view their own safe profile data" 
ON public.safe_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Admins can view all safe profile data
CREATE POLICY "Admins can view all safe profile data" 
ON public.safe_profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Policy: Users can update their own safe profile data
CREATE POLICY "Users can update their own safe profile data" 
ON public.safe_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Admins can manage all safe profile data
CREATE POLICY "Admins can manage all safe profile data" 
ON public.safe_profiles 
FOR ALL 
USING (is_admin(auth.uid()));

-- Policy: Users can insert their own safe profile data
CREATE POLICY "Users can insert their own safe profile data" 
ON public.safe_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);