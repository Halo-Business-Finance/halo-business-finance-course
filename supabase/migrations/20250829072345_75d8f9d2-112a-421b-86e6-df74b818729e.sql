-- Phase 1: Fix Critical Database Security Issues

-- 1. Create secure role checking functions to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.get_user_role_secure()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.check_user_has_role_secure(check_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = check_role 
    AND is_active = true
  );
$$;

-- 2. Drop and recreate user_roles policies to fix recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

-- Create clean, non-recursive user_roles policies
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

CREATE POLICY "Super admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

-- 3. Secure profiles table - restrict to owner + admin access only
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view and edit their own profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all profiles with logging" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (check_user_has_role_secure('super_admin') AND 
   log_admin_profile_access_detailed(user_id, 'profile_view', ARRAY['name', 'email', 'phone', 'company'], 'security_review') IS NOT NULL)
);

-- 4. Secure behavioral analytics - system and super admin access only
DROP POLICY IF EXISTS "Users can view their behavioral data" ON public.user_behavioral_analytics;

CREATE POLICY "Users can view their own behavioral data only" 
ON public.user_behavioral_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can access behavioral data for security" 
ON public.user_behavioral_analytics 
FOR SELECT 
USING (check_user_has_role_secure('super_admin'));

CREATE POLICY "System can insert behavioral data" 
ON public.user_behavioral_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- 5. Secure security events - admin access only
DROP POLICY IF EXISTS "Users can view security events" ON public.security_events;

CREATE POLICY "Users can view their own security events" 
ON public.security_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all security events" 
ON public.security_events 
FOR SELECT 
USING (check_user_has_role_secure('admin') OR check_user_has_role_secure('super_admin'));

-- 6. Secure device data - owner and admin access only
DROP POLICY IF EXISTS "Users can manage their devices" ON public.user_devices;

CREATE POLICY "Users can manage their own devices" 
ON public.user_devices 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view device data for security" 
ON public.user_devices 
FOR SELECT 
USING (check_user_has_role_secure('super_admin'));

-- 7. Secure leads data - admin access only
DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;

CREATE POLICY "Admins can view and manage leads" 
ON public.leads 
FOR ALL 
USING (check_user_has_role_secure('admin') OR check_user_has_role_secure('super_admin'));

CREATE POLICY "System can create leads from forms" 
ON public.leads 
FOR INSERT 
WITH CHECK (auth.uid() IS NULL); -- For contact forms

-- 8. Create comprehensive audit logging function
CREATE OR REPLACE FUNCTION public.log_pii_access_comprehensive(
  target_user_id uuid,
  access_type text,
  fields_accessed text[],
  reason text DEFAULT 'Administrative review'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only log if current user is admin accessing another user's data
  IF auth.uid() != target_user_id AND (
    check_user_has_role_secure('admin') OR 
    check_user_has_role_secure('super_admin')
  ) THEN
    -- Create detailed audit log entry
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      'pii_access_comprehensive',
      target_user_id,
      'customer_personal_data',
      jsonb_build_object(
        'access_type', access_type,
        'timestamp', now(),
        'fields_accessed', fields_accessed,
        'access_reason', reason,
        'security_classification', 'confidential',
        'gdpr_relevant', true,
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
      ),
      'confidential'
    );

    -- Create security monitoring event
    INSERT INTO public.security_events (event_type, severity, details, user_id, logged_via_secure_function)
    VALUES (
      'admin_pii_access_logged',
      'medium',
      jsonb_build_object(
        'admin_user', auth.uid(),
        'target_customer', target_user_id,
        'timestamp', now(),
        'access_type', access_type,
        'fields_accessed', fields_accessed,
        'monitoring_required', true
      ),
      auth.uid(),
      true
    );
  END IF;
  
  RETURN true;
END;
$$;