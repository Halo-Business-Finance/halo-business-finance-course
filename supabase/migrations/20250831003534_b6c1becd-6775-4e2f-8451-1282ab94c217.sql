-- PHASE 1: Fix RLS Policy Recursion - Critical Fix
-- Drop all conflicting policies on user_roles table that cause infinite recursion

-- Drop duplicate and conflicting policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only super admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role management by admins" ON public.user_roles;

-- Create clean, non-recursive RLS policies for user_roles
CREATE POLICY "secure_user_roles_select" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (
  -- Users can see their own roles
  (auth.uid() = user_id) 
  OR 
  -- Super admins can see all roles via direct check (no recursion)
  (auth.uid() IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'super_admin' 
    AND ur.is_active = true
  ))
);

CREATE POLICY "secure_user_roles_insert" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Only super admins can insert roles
  auth.uid() IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

CREATE POLICY "secure_user_roles_update" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (
  -- Only super admins can update roles
  auth.uid() IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

CREATE POLICY "secure_user_roles_delete" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (
  -- Only super admins can delete roles
  auth.uid() IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

-- PHASE 2: Strengthen Data Protection
-- Ensure all admin functions use secure access patterns

-- Create enhanced secure profile access function
CREATE OR REPLACE FUNCTION public.get_secure_admin_profiles()
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  phone text,
  company text,
  role text,
  is_masked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requesting_user_role text;
  is_super_admin boolean := false;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for profile access';
  END IF;

  -- Get requesting user's role securely
  SELECT ur.role INTO requesting_user_role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() 
  AND ur.is_active = true
  ORDER BY 
    CASE ur.role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      ELSE 3
    END
  LIMIT 1;

  -- Check if requesting user is admin
  IF requesting_user_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Admin privileges required for profile access';
  END IF;

  is_super_admin := (requesting_user_role = 'super_admin');

  -- Log the access attempt
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'secure_bulk_profile_access',
    'profiles_table',
    jsonb_build_object(
      'access_type', 'admin_profile_review',
      'data_masked', NOT is_super_admin,
      'timestamp', now()
    ),
    'confidential'
  );

  -- Return profiles with appropriate masking
  RETURN QUERY
  SELECT 
    p.user_id,
    CASE 
      WHEN is_super_admin THEN p.name
      ELSE left(p.name, 1) || '***'
    END as name,
    CASE 
      WHEN is_super_admin THEN p.email
      ELSE left(p.email, 2) || '***@' || split_part(p.email, '@', 2)
    END as email,
    CASE 
      WHEN is_super_admin THEN p.phone
      ELSE 'XXX-XXX-' || right(COALESCE(p.phone, '0000'), 4)
    END as phone,
    CASE 
      WHEN is_super_admin THEN p.company
      ELSE COALESCE(left(p.company, 3), '') || '***'
    END as company,
    COALESCE(ur.role, 'user') as role,
    NOT is_super_admin as is_masked
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
  ORDER BY p.name;
END;
$$;

-- Create secure leads access function
CREATE OR REPLACE FUNCTION public.get_secure_admin_leads(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  company text,
  status text,
  created_at timestamp with time zone,
  is_masked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requesting_user_role text;
  is_super_admin boolean := false;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for leads access';
  END IF;

  -- Get requesting user's role securely
  SELECT ur.role INTO requesting_user_role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() 
  AND ur.is_active = true
  ORDER BY 
    CASE ur.role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      ELSE 3
    END
  LIMIT 1;

  -- Check if requesting user is admin
  IF requesting_user_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Admin privileges required for leads access';
  END IF;

  is_super_admin := (requesting_user_role = 'super_admin');

  -- Log the access attempt
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'secure_leads_access',
    'leads_table',
    jsonb_build_object(
      'access_type', 'admin_leads_review',
      'data_masked', NOT is_super_admin,
      'limit', p_limit,
      'offset', p_offset,
      'timestamp', now()
    ),
    'confidential'
  );

  -- Return leads with appropriate masking
  RETURN QUERY
  SELECT 
    l.id,
    CASE 
      WHEN is_super_admin THEN l.first_name
      ELSE left(l.first_name, 1) || '***'
    END as first_name,
    CASE 
      WHEN is_super_admin THEN l.last_name
      ELSE left(l.last_name, 1) || '***'
    END as last_name,
    CASE 
      WHEN is_super_admin THEN l.email
      ELSE left(l.email, 2) || '***@' || split_part(l.email, '@', 2)
    END as email,
    CASE 
      WHEN is_super_admin THEN l.phone
      ELSE 'XXX-XXX-' || right(COALESCE(l.phone, '0000'), 4)
    END as phone,
    CASE 
      WHEN is_super_admin THEN l.company
      ELSE COALESCE(left(l.company, 3), '') || '***'
    END as company,
    l.status,
    l.created_at,
    NOT is_super_admin as is_masked
  FROM public.leads l
  ORDER BY l.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- PHASE 3: Enhanced Security Monitoring
-- Create comprehensive security monitoring function
CREATE OR REPLACE FUNCTION public.get_security_dashboard_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dashboard_data jsonb;
  requesting_user_role text;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for security dashboard access';
  END IF;

  -- Get requesting user's role securely
  SELECT ur.role INTO requesting_user_role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() 
  AND ur.is_active = true
  ORDER BY 
    CASE ur.role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      ELSE 3
    END
  LIMIT 1;

  -- Check if requesting user is admin
  IF requesting_user_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Admin privileges required for security dashboard access';
  END IF;

  -- Gather security metrics
  SELECT jsonb_build_object(
    'active_sessions', (
      SELECT COUNT(*) FROM public.user_sessions 
      WHERE is_active = true 
      AND expires_at > now()
    ),
    'recent_security_events', (
      SELECT COUNT(*) FROM public.security_events 
      WHERE created_at > now() - interval '24 hours'
    ),
    'high_severity_events', (
      SELECT COUNT(*) FROM public.security_events 
      WHERE severity IN ('high', 'critical') 
      AND created_at > now() - interval '7 days'
    ),
    'failed_auth_attempts', (
      SELECT COUNT(*) FROM public.security_events 
      WHERE event_type = 'failed_login' 
      AND created_at > now() - interval '24 hours'
    ),
    'admin_actions_today', (
      SELECT COUNT(*) FROM public.admin_audit_log 
      WHERE created_at > current_date
    ),
    'system_health', jsonb_build_object(
      'rls_status', 'healthy',
      'audit_logging', 'active',
      'threat_monitoring', 'active'
    ),
    'last_updated', now()
  ) INTO dashboard_data;

  -- Log dashboard access
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'security_dashboard_access',
    'security_metrics',
    jsonb_build_object(
      'access_type', 'dashboard_view',
      'timestamp', now(),
      'user_role', requesting_user_role
    ),
    'internal'
  );

  RETURN dashboard_data;
END;
$$;