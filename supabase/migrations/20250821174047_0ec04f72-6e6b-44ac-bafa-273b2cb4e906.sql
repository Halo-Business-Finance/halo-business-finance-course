-- Remove the problematic user_session_info view
-- This view is flagged as a security definer view by the linter
-- We already have secure functions get_user_session_info() and get_admin_session_info()

DROP VIEW IF EXISTS public.user_session_info CASCADE;

-- Log the security improvement
INSERT INTO public.security_events (event_type, severity, details)
VALUES (
  'security_definer_view_removed',
  'low',
  jsonb_build_object(
    'action', 'dropped_user_session_info_view',
    'timestamp', now(),
    'security_improvement', 'eliminated_direct_session_access_view',
    'replacement', 'using_secure_functions_only'
  )
);