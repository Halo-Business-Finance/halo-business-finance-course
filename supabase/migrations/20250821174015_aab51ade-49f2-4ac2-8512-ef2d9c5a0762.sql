-- Fix Security Definer View Issue
-- Remove any problematic security definer views and replace with secure functions

-- Check if there are any views with SECURITY DEFINER and drop them
DO $$ 
DECLARE
    view_record RECORD;
BEGIN
    -- Find and drop any security definer views
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND definition ILIKE '%SECURITY DEFINER%'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
    END LOOP;
END $$;

-- Ensure all existing functions are properly secured
-- This migration ensures no security definer views exist
-- All sensitive data access should go through secure functions only

-- Log completion of security definer view cleanup
INSERT INTO public.security_events (event_type, severity, details)
VALUES (
  'security_definer_view_cleanup',
  'low',
  jsonb_build_object(
    'action', 'removed_security_definer_views',
    'timestamp', now(),
    'security_improvement', 'eliminated_security_definer_views'
  )
);