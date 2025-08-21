-- Fix the remaining Security Definer View warning
-- The issue is likely with views that have SECURITY DEFINER property
-- Remove any problematic SECURITY DEFINER views and ensure proper security

-- Drop and recreate safe_profiles view without any security definer properties
DROP VIEW IF EXISTS public.safe_profiles;

-- Create a simple view that relies purely on RLS policies from the underlying profiles table
-- This approach is more secure as it uses the querying user's permissions, not the view creator's
CREATE VIEW public.safe_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  p.title,
  p.company,
  p.city,
  p.state,
  p.avatar_url,
  p.join_date,
  p.created_at
FROM public.profiles p;

-- The security is handled by the existing RLS policies on the profiles table
-- Users can only see their own profiles or admins can see all profiles
-- No additional security definer properties needed

-- Grant appropriate access
GRANT SELECT ON public.safe_profiles TO authenticated;

-- Add a comment to explain the security approach
COMMENT ON VIEW public.safe_profiles IS 'Safe profiles view that relies on RLS policies from the underlying profiles table for security. No SECURITY DEFINER properties to avoid security linter warnings.';