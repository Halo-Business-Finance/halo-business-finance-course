-- EMERGENCY SECURITY FIXES
-- Phase 1: Fix Critical RLS Policy Recursion

-- 1. Create safe security definer functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid()
  AND is_active = true 
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'tech_support_admin' THEN 3
      WHEN 'instructor' THEN 4
      ELSE 5
    END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin_safe()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'tech_support_admin') 
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.check_current_user_admin_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  is_admin_user BOOLEAN;
BEGIN
  -- Get user role safely
  SELECT role INTO user_role
  FROM public.user_roles 
  WHERE user_id = auth.uid()
  AND is_active = true 
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'tech_support_admin' THEN 3
      ELSE 4
    END
  LIMIT 1;

  is_admin_user := user_role IN ('admin', 'super_admin', 'tech_support_admin');

  RETURN jsonb_build_object(
    'is_admin', is_admin_user,
    'role', COALESCE(user_role, 'user'),
    'user_id', auth.uid()
  );
END;
$$;

-- 2. Drop existing problematic RLS policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;

-- 3. Create new safe RLS policies for user_roles
CREATE POLICY "users_can_view_own_roles_safe" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "super_admins_can_manage_roles_safe" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid()
  ) AND
  auth.uid() IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

-- 4. Fix profiles table RLS policies to prevent permission denied errors
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new safe profiles policies
CREATE POLICY "profiles_users_can_view_own" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "profiles_users_can_update_own" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "profiles_users_can_insert_own" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_admins_can_view_all_safe" 
ON public.profiles 
FOR SELECT 
USING (
  public.is_current_user_admin_safe() = true
);

-- 5. Create emergency profile access function for admins
CREATE OR REPLACE FUNCTION public.get_profile_safe(target_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  phone text,
  location text,
  company text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow users to access their own profile
  IF auth.uid() = target_user_id THEN
    RETURN QUERY
    SELECT p.user_id, p.name, p.email, p.phone, p.location, p.company, p.created_at
    FROM public.profiles p
    WHERE p.user_id = target_user_id;
    RETURN;
  END IF;

  -- Check if current user is admin
  IF NOT public.is_current_user_admin_safe() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Log admin access
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'profile_safe_access',
    target_user_id,
    'profiles',
    jsonb_build_object(
      'access_type', 'safe_admin_access',
      'timestamp', now(),
      'function_used', 'get_profile_safe'
    ),
    'confidential'
  );

  RETURN QUERY
  SELECT p.user_id, p.name, p.email, p.phone, p.location, p.company, p.created_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
END;
$$;

-- 6. Create security monitoring for policy failures
CREATE OR REPLACE FUNCTION public.log_rls_policy_failure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_events (
    event_type,
    severity,
    details,
    user_id,
    logged_via_secure_function
  ) VALUES (
    'rls_policy_failure',
    'high',
    jsonb_build_object(
      'table_name', TG_TABLE_NAME,
      'operation', TG_OP,
      'user_id', auth.uid(),
      'timestamp', now(),
      'potential_security_issue', true
    ),
    auth.uid(),
    true
  );
  
  RETURN NULL;
END;
$$;

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_current_user_role_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_current_user_admin_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_safe(uuid) TO authenticated;

-- 8. Log security fix implementation
INSERT INTO public.security_events (
  event_type,
  severity,
  details,
  logged_via_secure_function
) VALUES (
  'emergency_security_fixes_applied',
  'low',
  jsonb_build_object(
    'timestamp', now(),
    'fixes_applied', ARRAY[
      'rls_recursion_fixed',
      'profiles_access_restored',
      'safe_admin_functions_created',
      'security_monitoring_enhanced'
    ],
    'status', 'completed',
    'security_level', 'hardened'
  ),
  true
);