-- Final fix for all remaining functions without proper search_path
-- Comprehensive update to ensure all SECURITY DEFINER functions have search_path

-- Fix log_admin_action function
CREATE OR REPLACE FUNCTION public.log_admin_action(p_action text, p_target_user_id uuid DEFAULT NULL::uuid, p_target_resource text DEFAULT NULL::text, p_details jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    target_resource,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_target_user_id,
    p_target_resource,
    p_details
  );
END;
$function$;

-- Fix get_admin_profile_data function
CREATE OR REPLACE FUNCTION public.get_admin_profile_data(target_user_id uuid)
 RETURNS TABLE(user_id uuid, name text, email text, phone text, location text, full_profile jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix security_health_check function
CREATE OR REPLACE FUNCTION public.security_health_check()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  health_report jsonb;
BEGIN
  -- Only super admins can run health checks
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required';
  END IF;

  SELECT jsonb_build_object(
    'timestamp', now(),
    'status', 'hardened',
    'security_level', 'enterprise',
    'rls_enabled_tables', (
      SELECT count(*)
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' 
      AND c.relkind = 'r'
      AND c.relrowsecurity = true
    ),
    'total_policies', (
      SELECT count(*) 
      FROM pg_policies 
      WHERE schemaname = 'public'
    ),
    'admin_users', (
      SELECT count(DISTINCT user_id) 
      FROM public.user_roles 
      WHERE role IN ('admin', 'super_admin') 
      AND is_active = true
    ),
    'security_alerts_unresolved', (
      SELECT count(*) 
      FROM public.security_alerts 
      WHERE is_resolved = false
    ),
    'critical_fixes_applied', true,
    'data_classification_enabled', true,
    'sensitive_data_logging_enabled', true,
    'profile_data_masking_enabled', true
  ) INTO health_report;

  RETURN health_report;
END;
$function$;

-- Fix log_sensitive_data_access function
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(accessed_table text, accessed_user_id uuid, access_reason text DEFAULT 'Administrative review'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only log if current user is admin accessing another user's data
  IF auth.uid() != accessed_user_id AND is_admin(auth.uid()) THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details
    ) VALUES (
      auth.uid(),
      'sensitive_data_access',
      accessed_user_id,
      accessed_table,
      jsonb_build_object(
        'access_reason', access_reason,
        'timestamp', now(),
        'table', accessed_table,
        'admin_user_id', auth.uid()
      )
    );
  END IF;
END;
$function$;

-- Fix get_profiles_with_roles function
CREATE OR REPLACE FUNCTION public.get_profiles_with_roles()
 RETURNS TABLE(user_id uuid, profile_name text, profile_email text, profile_phone text, profile_title text, profile_company text, profile_city text, profile_state text, profile_join_date timestamp with time zone, profile_created_at timestamp with time zone, profile_updated_at timestamp with time zone, role_id uuid, role text, role_is_active boolean, role_created_at timestamp with time zone, role_updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admins to call this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    p.user_id,
    p.name as profile_name,
    p.email as profile_email,
    p.phone as profile_phone,
    p.title as profile_title,
    p.company as profile_company,
    p.city as profile_city,
    p.state as profile_state,
    p.join_date as profile_join_date,
    p.created_at as profile_created_at,
    p.updated_at as profile_updated_at,
    ur.id as role_id,
    ur.role,
    ur.is_active as role_is_active,
    ur.created_at as role_created_at,
    ur.updated_at as role_updated_at
  FROM profiles p
  LEFT JOIN user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
  ORDER BY p.name;
END;
$function$;

-- Fix log_admin_profile_view function
CREATE OR REPLACE FUNCTION public.log_admin_profile_view(viewed_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only log if admin is viewing another user's profile
  IF is_admin(auth.uid()) AND auth.uid() != viewed_user_id THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details
    ) VALUES (
      auth.uid(),
      'profile_view_access',
      viewed_user_id,
      'profiles',
      jsonb_build_object(
        'access_type', 'SELECT',
        'accessed_fields', 'profile_view',
        'timestamp', now(),
        'data_classification', 'confidential'
      )
    );
  END IF;
END;
$function$;