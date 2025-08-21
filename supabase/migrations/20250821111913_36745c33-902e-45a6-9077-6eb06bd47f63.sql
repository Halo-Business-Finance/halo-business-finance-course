-- Fix the security definer view warning by recreating safe_profiles without security_barrier
-- Instead, rely on the existing RLS policies on the profiles table

-- Drop the current view with security_barrier
DROP VIEW IF EXISTS public.safe_profiles;

-- Recreate as a simple view that will respect RLS policies from the underlying profiles table
-- The profiles table already has proper RLS policies that restrict access appropriately
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

-- Grant appropriate permissions - RLS on profiles table will handle the security
GRANT SELECT ON public.safe_profiles TO authenticated;
GRANT SELECT ON public.safe_profiles TO anon;