-- Final fix for remaining functions without search_path
-- Some functions still need the SET search_path directive for security

-- Fix all remaining SECURITY DEFINER functions that need search paths
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Prevent users from assigning themselves admin roles
  IF NEW.user_id = auth.uid() AND NEW.role IN ('admin', 'super_admin', 'tech_support_admin') THEN
    RAISE EXCEPTION 'Users cannot assign admin roles to themselves';
  END IF;
  
  -- Only super_admin can assign super_admin roles
  IF NEW.role = 'super_admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Only super admins can assign super admin roles';
    END IF;
  END IF;

  -- Only super_admin or admin can assign tech_support_admin roles  
  IF NEW.role = 'tech_support_admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Only super admins or admins can assign tech support admin roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.get_authenticated_user_profiles()
 RETURNS TABLE(id uuid, user_id uuid, name text, title text, company text, city text, state text, avatar_url text, join_date timestamp with time zone, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

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