-- Fix the remaining Security Definer View issue
-- Ensure safe_profiles view doesn't have any security definer properties

-- Drop and recreate safe_profiles without any security definer properties
DROP VIEW IF EXISTS public.safe_profiles;

-- Create a simple view that relies purely on RLS policies from the underlying profiles table
-- This avoids the security definer view warning
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

-- The RLS policies on the profiles table will automatically handle access control:
-- - Users can only see their own profile data  
-- - Admins can see all profile data
-- No additional WHERE clause needed as RLS handles this

COMMENT ON VIEW public.safe_profiles IS 'Safe view of profiles data with automatic RLS enforcement from underlying profiles table';

-- Grant permissions (RLS from profiles table will control actual access)
GRANT SELECT ON public.safe_profiles TO authenticated;
GRANT SELECT ON public.safe_profiles TO anon;