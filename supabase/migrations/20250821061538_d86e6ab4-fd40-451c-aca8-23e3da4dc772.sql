-- Update the instructors table RLS policy to require authentication
-- This prevents public access to business intelligence data

-- Drop the existing public access policy
DROP POLICY IF EXISTS "Anyone can view active instructors" ON public.instructors;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view active instructors" 
ON public.instructors 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);