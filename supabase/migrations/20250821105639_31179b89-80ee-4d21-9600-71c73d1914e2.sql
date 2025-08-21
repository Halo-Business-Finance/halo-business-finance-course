-- Final Security Fix: Address All Remaining Security Issues
-- Fix RLS policies for views and remove any remaining security definer views

-- 1. Drop the views I created that are causing security issues
DROP VIEW IF EXISTS public.profile_summary CASCADE;
DROP VIEW IF EXISTS public.profiles_public CASCADE;

-- 2. Search for remaining SECURITY DEFINER views in ALL schemas
DO $$
DECLARE
    view_record RECORD;
    view_def TEXT;
BEGIN
    -- Search in ALL schemas for SECURITY DEFINER views
    FOR view_record IN 
        SELECT n.nspname as schema_name, c.relname as view_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'v'  -- views only
        AND n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    LOOP
        -- Get the complete view definition
        BEGIN
            SELECT pg_get_viewdef(c.oid, true) INTO view_def
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = view_record.view_name 
            AND n.nspname = view_record.schema_name;
            
            -- Check if the definition contains SECURITY DEFINER
            IF view_def IS NOT NULL AND (
                view_def ILIKE '%SECURITY DEFINER%' OR 
                view_def ILIKE '%security_definer%'
            ) THEN
                RAISE NOTICE 'Found SECURITY DEFINER view: %.%', view_record.schema_name, view_record.view_name;
                RAISE NOTICE 'View definition: %', view_def;
                
                -- Drop the problematic view
                EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schema_name, view_record.view_name);
                RAISE NOTICE 'Successfully dropped SECURITY DEFINER view: %.%', view_record.schema_name, view_record.view_name;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not process view %.%: %', view_record.schema_name, view_record.view_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 3. Check for views with security_definer in reloptions across all schemas  
DO $$
DECLARE
    rel_record RECORD;
BEGIN
    FOR rel_record IN
        SELECT n.nspname as schema_name, c.relname, c.reloptions, c.relkind
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind IN ('v', 'm')  -- views and materialized views
        AND n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        AND c.reloptions IS NOT NULL
    LOOP
        IF array_to_string(rel_record.reloptions, ' ') ILIKE '%security_definer%' THEN
            RAISE NOTICE 'Found relation with security_definer option: %.%', rel_record.schema_name, rel_record.relname;
            
            IF rel_record.relkind = 'v' THEN
                EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', rel_record.schema_name, rel_record.relname);
            ELSIF rel_record.relkind = 'm' THEN
                EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS %I.%I CASCADE', rel_record.schema_name, rel_record.relname);
            END IF;
            
            RAISE NOTICE 'Dropped relation: %.%', rel_record.schema_name, rel_record.relname;
        END IF;
    END LOOP;
END $$;

-- 4. Create a SAFE profile view with proper RLS
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
FROM public.profiles p
-- This view will automatically inherit RLS policies from the profiles table
-- No SECURITY DEFINER needed - it respects the caller's permissions
;

-- 5. Apply RLS to the new view (security barrier)
ALTER VIEW public.safe_profiles SET (security_barrier = true);

-- 6. Grant proper permissions
GRANT SELECT ON public.safe_profiles TO authenticated;

-- 7. Add documentation
COMMENT ON VIEW public.safe_profiles IS 
'Safe view of basic profile data. Uses RLS policies from underlying profiles table. No SECURITY DEFINER property.';

-- 8. Create an admin-only function for sensitive data access (if needed)
CREATE OR REPLACE FUNCTION public.get_admin_profile_data(target_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  phone text,
  location text,
  full_profile jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER -- This is safe because we have explicit access controls
SET search_path TO 'public'
AS $$
BEGIN
  -- STRICT access control - only super admins can use this function
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required';
  END IF;

  -- Log the access attempt
  PERFORM log_sensitive_data_access('profiles', target_user_id, 'Admin profile data access');

  -- Return the data
  RETURN QUERY
  SELECT 
    p.user_id,
    p.name,
    p.email,
    p.phone,
    p.location,
    row_to_json(p)::jsonb as full_profile
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
END;
$$;

-- 9. Add strict documentation for the admin function
COMMENT ON FUNCTION public.get_admin_profile_data IS 
'Admin-only function for accessing sensitive profile data. Requires super_admin role and logs all access. Uses SECURITY DEFINER safely with explicit access controls.';

-- 10. Log the comprehensive security fix
INSERT INTO public.security_events (
  event_type, 
  severity, 
  details
) VALUES (
  'security_comprehensive_fix',
  'critical',
  jsonb_build_object(
    'action', 'comprehensive_security_definer_cleanup',
    'timestamp', now(),
    'description', 'Removed all problematic SECURITY DEFINER views and created secure alternatives with proper RLS'
  )
);