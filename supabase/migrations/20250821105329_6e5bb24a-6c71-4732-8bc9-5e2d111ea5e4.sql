-- Fix Security Definer View Warning
-- Remove SECURITY DEFINER from any views that might have it

-- Check and fix any existing security definer views
-- This addresses linter warning 0010_security_definer_view

-- Drop any views that might have SECURITY DEFINER property
DROP VIEW IF EXISTS public.profiles_secure CASCADE;

-- Create a safe version without SECURITY DEFINER
-- Views with SECURITY DEFINER can bypass RLS and create security issues
-- Instead, we'll use proper RLS policies on the base table

-- Alternative: Create a function instead of a view for sensitive data access
CREATE OR REPLACE FUNCTION public.get_masked_profile_data(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  masked_email text,
  masked_phone text,
  masked_location text,
  title text,
  company text,
  avatar_url text,
  city text,
  state text,
  theme text,
  language text,
  timezone text,
  join_date timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow access to own data or by admins
  IF target_user_id != auth.uid() AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Cannot view other users profile data';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.name,
    CASE 
      WHEN can_view_sensitive_profile_data(p.user_id) THEN p.email
      ELSE CASE 
        WHEN p.email IS NOT NULL THEN 
          substring(p.email from 1 for 2) || '***@' || split_part(p.email, '@', 2)
        ELSE NULL
      END
    END as masked_email,
    CASE 
      WHEN can_view_sensitive_profile_data(p.user_id) THEN p.phone
      ELSE CASE 
        WHEN p.phone IS NOT NULL THEN '***-***-' || right(p.phone, 4)
        ELSE NULL
      END
    END as masked_phone,
    CASE 
      WHEN can_view_sensitive_profile_data(p.user_id) THEN p.location
      ELSE CASE 
        WHEN p.location IS NOT NULL THEN split_part(p.location, ',', -1) -- Show only state/country
        ELSE NULL
      END
    END as masked_location,
    p.title,
    p.company,
    p.avatar_url,
    p.city,
    p.state,
    p.theme,
    p.language,
    p.timezone,
    p.join_date,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
END;
$$;

-- Create a safe public view without SECURITY DEFINER
CREATE VIEW public.profiles_public AS
SELECT 
  id,
  user_id,
  name,
  title,
  company,
  city,
  state,
  avatar_url,
  join_date,
  created_at
FROM public.profiles
WHERE 
  -- Only show public profile data
  auth.uid() = user_id OR is_admin(auth.uid());

-- Grant appropriate permissions
GRANT SELECT ON public.profiles_public TO authenticated;

-- Add RLS to the public view
ALTER VIEW public.profiles_public SET (security_barrier = true);

-- Create comment explaining the security approach
COMMENT ON FUNCTION public.get_masked_profile_data IS 
'Secure function to access profile data with proper masking. Uses SECURITY DEFINER safely with explicit access controls.';

COMMENT ON VIEW public.profiles_public IS 
'Safe public view of profiles without SECURITY DEFINER. Shows only non-sensitive profile information.';

-- Log the security fix
INSERT INTO public.security_events (
  event_type, 
  severity, 
  details
) VALUES (
  'security_hardening',
  'high',
  jsonb_build_object(
    'action', 'removed_security_definer_views',
    'timestamp', now(),
    'description', 'Removed potentially unsafe SECURITY DEFINER views and replaced with secure alternatives'
  )
);