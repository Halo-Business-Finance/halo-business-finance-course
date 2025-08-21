-- Fix Security Definer View Warning
-- Remove any views with SECURITY DEFINER that may pose security risks

-- Drop any existing security definer views that might have been created
DROP VIEW IF EXISTS public.profiles_secure CASCADE;

-- Instead of a security definer view, we'll rely on the security functions
-- The get_masked_profile_data function provides the same functionality safely