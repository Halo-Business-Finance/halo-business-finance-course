-- Remove unused safe_profiles view to address security warning
-- This view was flagged by the linter for using SECURITY DEFINER
-- Since it's not used in the application, we can safely remove it

DROP VIEW IF EXISTS public.safe_profiles;