-- Fix security vulnerability by recreating safe_profiles view with proper access controls
-- The current safe_profiles view has no access restrictions, allowing anyone to see all user data

-- First, drop the existing insecure view
DROP VIEW IF EXISTS public.safe_profiles;

-- Recreate safe_profiles as a secure view that respects user permissions
-- Users can only see their own data, admins can see all data
CREATE VIEW public.safe_profiles 
WITH (security_barrier = true) AS
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
FROM public.profiles p
WHERE 
  -- Users can view their own profile data
  auth.uid() = p.user_id 
  OR 
  -- Admins can view all profile data
  is_admin(auth.uid());

-- Grant appropriate permissions
GRANT SELECT ON public.safe_profiles TO authenticated;
GRANT SELECT ON public.safe_profiles TO anon;