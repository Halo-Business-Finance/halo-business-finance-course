-- CRITICAL: Fix remaining anonymous access vulnerability
-- The security check shows 7 anon grants still exist - this must be completely removed

-- 1. Completely revoke ALL access from anonymous users to profiles and safe_profiles
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.safe_profiles FROM anon;

-- 2. Revoke all function access from anonymous users  
REVOKE ALL ON FUNCTION public.get_safe_profiles() FROM anon;
REVOKE ALL ON FUNCTION public.verify_profile_access_security() FROM anon;

-- 3. Check what other grants might exist and revoke them
DO $$
DECLARE
    grant_record RECORD;
BEGIN
    -- Find and revoke any remaining grants to anon role on profile-related objects
    FOR grant_record IN 
        SELECT grantee, table_name, privilege_type
        FROM information_schema.table_privileges 
        WHERE table_schema = 'public' 
          AND grantee = 'anon'
          AND (table_name LIKE '%profile%' OR table_name = 'safe_profiles')
    LOOP
        EXECUTE format('REVOKE %s ON public.%s FROM anon', 
                      grant_record.privilege_type, grant_record.table_name);
    END LOOP;
END $$;

-- 4. Create an even more restrictive safe_profiles implementation
DROP VIEW IF EXISTS public.safe_profiles;
DROP FUNCTION IF EXISTS public.get_safe_profiles();

-- 5. Create a new, more secure function with explicit authentication checks
CREATE OR REPLACE FUNCTION public.get_authenticated_user_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  title text,
  company text,
  city text,
  state text,
  avatar_url text,
  join_date timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- ABSOLUTE REQUIREMENT: User must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'SECURITY VIOLATION: Unauthenticated access to customer data is forbidden'
      USING ERRCODE = '42501';
  END IF;

  -- ABSOLUTE REQUIREMENT: User must have active session
  IF NOT EXISTS (
    SELECT 1 FROM auth.sessions 
    WHERE user_id = auth.uid() 
    AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'SECURITY VIOLATION: Valid session required to access customer data'
      USING ERRCODE = '42501';
  END IF;

  -- Log every access attempt for security monitoring
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'authenticated_profile_access',
    'low',
    jsonb_build_object(
      'function_called', 'get_authenticated_user_profiles',
      'timestamp', now(),
      'user_id', auth.uid(),
      'access_type', 'profile_data_query'
    ),
    auth.uid()
  );

  -- Return data with strict access control
  RETURN QUERY
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
    -- Users can ONLY see their own data
    p.user_id = auth.uid()
    OR 
    -- Admins can see all data with explicit logging
    (is_admin(auth.uid()) AND (
      SELECT public.log_admin_profile_view(p.user_id) IS NOT NULL OR true
    ));
END;
$$;

-- 6. Create new secure view
CREATE VIEW public.safe_profiles AS
SELECT * FROM public.get_authenticated_user_profiles();

-- 7. Grant ONLY to authenticated role - NO public, NO anon
GRANT EXECUTE ON FUNCTION public.get_authenticated_user_profiles() TO authenticated;
GRANT SELECT ON public.safe_profiles TO authenticated;

-- 8. Verify security is now properly configured
SELECT 
  'SECURITY_STATUS' as check_type,
  jsonb_build_object(
    'anon_grants_removed', NOT EXISTS (
      SELECT 1 FROM information_schema.table_privileges 
      WHERE grantee = 'anon' AND table_name = 'safe_profiles'
    ),
    'public_grants_removed', NOT EXISTS (
      SELECT 1 FROM information_schema.routine_privileges 
      WHERE grantee = 'PUBLIC' AND routine_name LIKE '%profile%'
    ),
    'authenticated_only_access', EXISTS (
      SELECT 1 FROM information_schema.table_privileges 
      WHERE grantee = 'authenticated' AND table_name = 'safe_profiles'
    ),
    'timestamp', now()
  ) as security_status;