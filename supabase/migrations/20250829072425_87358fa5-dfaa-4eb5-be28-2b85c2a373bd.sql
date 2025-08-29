-- Phase 1: Fix Critical Database Security Issues (Part 2)

-- First, drop ALL existing conflicting policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only super admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create clean, non-recursive user_roles policies
CREATE POLICY "Users can view their own roles only" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles" 
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

-- Drop existing profile policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view and edit their own profile" ON public.profiles;

-- Create secure profile policies
CREATE POLICY "Users can manage their own profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view profiles with audit logging" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (check_user_has_role_secure('super_admin') AND 
   log_pii_access_comprehensive(user_id, 'profile_view', ARRAY['name', 'email', 'phone', 'company'], 'security_admin_access') IS NOT NULL)
);

-- Update leads policies for better security
DROP POLICY IF EXISTS "Only admins can view leads" ON public.leads;
DROP POLICY IF EXISTS "Only admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "Only admins can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view and manage leads" ON public.leads;

CREATE POLICY "Admins can manage leads securely" 
ON public.leads 
FOR ALL 
USING (check_user_has_role_secure('admin') OR check_user_has_role_secure('super_admin'));

CREATE POLICY "Public can submit leads via forms" 
ON public.leads 
FOR INSERT 
WITH CHECK (auth.uid() IS NULL);

-- Create enhanced monitoring function
CREATE OR REPLACE FUNCTION public.monitor_profile_access_patterns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  suspicious_access RECORD;
BEGIN
  -- Detect rapid customer data access patterns
  FOR suspicious_access IN
    SELECT 
      admin_user_id,
      COUNT(DISTINCT target_user_id) as customers_accessed,
      COUNT(*) as total_operations,
      MIN(created_at) as access_start,
      MAX(created_at) as access_end
    FROM admin_audit_log 
    WHERE action LIKE '%pii_access%'
      AND created_at > now() - interval '1 hour'
    GROUP BY admin_user_id
    HAVING COUNT(DISTINCT target_user_id) >= 10  -- 10+ customers in 1 hour = suspicious
  LOOP
    -- Create security alert for rapid access
    PERFORM create_security_alert(
      'rapid_customer_data_access',
      'high',
      'Rapid Customer Data Access Detected',
      format('Admin %s accessed %s customer records in 1 hour. Potential data scraping detected.', 
             suspicious_access.admin_user_id, 
             suspicious_access.customers_accessed),
      jsonb_build_object(
        'admin_user', suspicious_access.admin_user_id,
        'customers_accessed', suspicious_access.customers_accessed,
        'total_operations', suspicious_access.total_operations,
        'access_duration_minutes', EXTRACT(EPOCH FROM (suspicious_access.access_end - suspicious_access.access_start))/60,
        'requires_investigation', true
      )
    );
  END LOOP;
END;
$$;

-- Update behavioral analytics policies
DROP POLICY IF EXISTS "Users can view their own behavioral data only" ON public.user_behavioral_analytics;
DROP POLICY IF EXISTS "Super admins can access behavioral data for security" ON public.user_behavioral_analytics;
DROP POLICY IF EXISTS "System can insert behavioral data" ON public.user_behavioral_analytics;

CREATE POLICY "Users can view their behavioral analytics" 
ON public.user_behavioral_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can access behavioral data" 
ON public.user_behavioral_analytics 
FOR SELECT 
USING (check_user_has_role_secure('super_admin'));

CREATE POLICY "System can insert behavioral analytics" 
ON public.user_behavioral_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);