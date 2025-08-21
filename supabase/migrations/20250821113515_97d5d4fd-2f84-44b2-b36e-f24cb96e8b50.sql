-- CRITICAL SECURITY FIX: Protect customer personal information from unauthorized access
-- Remove public access to safe_profiles functionality

-- 1. Revoke dangerous PUBLIC access to the function
REVOKE ALL ON FUNCTION public.get_safe_profiles() FROM PUBLIC;

-- 2. Only grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.get_safe_profiles() TO authenticated;

-- 3. Revoke any potential public access to the view
REVOKE ALL ON public.safe_profiles FROM PUBLIC;
REVOKE ALL ON public.safe_profiles FROM anon;

-- 4. Only grant view access to authenticated users
GRANT SELECT ON public.safe_profiles TO authenticated;

-- 5. Add additional security validation to the function
CREATE OR REPLACE FUNCTION public.get_safe_profiles()
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
  -- CRITICAL: Ensure only authenticated users can access this function
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required to view profile data'
      USING ERRCODE = 'PGSQL_ERROR_INSUFFICIENT_PRIVILEGE';
  END IF;

  -- Log the access attempt for security monitoring
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'profile_data_access_attempt',
    'low',
    jsonb_build_object(
      'function_called', 'get_safe_profiles',
      'timestamp', now(),
      'user_authenticated', auth.uid() IS NOT NULL
    ),
    auth.uid()
  );

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
    -- Users can only see their own profile
    p.user_id = auth.uid()
    OR 
    -- Admins can see all profiles (with proper logging)
    (is_admin(auth.uid()) AND (
      SELECT public.log_admin_profile_view(p.user_id) IS NOT NULL OR true
    ));
END;
$$;

-- 6. Ensure the view has proper security
DROP VIEW IF EXISTS public.safe_profiles;
CREATE VIEW public.safe_profiles AS
SELECT * FROM public.get_safe_profiles();

-- 7. Set proper ownership and permissions
GRANT SELECT ON public.safe_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_safe_profiles() TO authenticated;

-- 8. Create a security validation check
CREATE OR REPLACE FUNCTION public.verify_profile_access_security()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  public_grants INTEGER;
  anon_grants INTEGER;
  security_status jsonb;
BEGIN
  -- Check for dangerous public grants
  SELECT COUNT(*) INTO public_grants
  FROM information_schema.routine_privileges 
  WHERE routine_schema = 'public' 
    AND routine_name = 'get_safe_profiles'
    AND grantee = 'PUBLIC';

  SELECT COUNT(*) INTO anon_grants  
  FROM information_schema.table_privileges 
  WHERE table_schema = 'public' 
    AND table_name = 'safe_profiles' 
    AND grantee = 'anon';

  security_status := jsonb_build_object(
    'timestamp', now(),
    'public_function_grants', public_grants,
    'anon_view_grants', anon_grants,
    'security_level', CASE 
      WHEN public_grants = 0 AND anon_grants = 0 THEN 'SECURE'
      ELSE 'VULNERABLE'
    END,
    'customer_data_protected', public_grants = 0 AND anon_grants = 0
  );

  -- Log the security check
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'profile_access_security_verified',
    'low',
    security_status
  );

  RETURN security_status;
END;
$$;

-- 9. Run the security verification
SELECT verify_profile_access_security();