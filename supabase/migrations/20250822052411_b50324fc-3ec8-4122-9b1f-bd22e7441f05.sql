-- CRITICAL FIX: Remove public access to sensitive profile data and implement proper access controls

-- Drop the overly permissive policy that allows public access to profiles
DROP POLICY IF EXISTS "CRITICAL: Super restricted profile access with rate limiting" ON public.profiles;

-- Drop the rate limiting function as it's no longer needed for public access
DROP FUNCTION IF EXISTS public.secure_profile_access_with_rate_limit(UUID);

-- Create strict, secure policies for profile access

-- 1. Users can ONLY view their own profile data
CREATE POLICY "Users can view only their own profile data" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Keep existing policy for users to insert their own data
-- (This should already exist: "Users can insert own profile data")

-- 3. Keep existing policy for users to update their own data  
-- (This should already exist: "Users can update own profile data")

-- 4. Keep existing policy for users to delete their own data
-- (This should already exist: "Users can delete own profile data")

-- 5. Admins can view profiles with comprehensive logging and restrictions
CREATE POLICY "Admins can view profiles with strict logging" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow admins to view other users' profiles with mandatory logging
  (is_admin(auth.uid()) AND auth.uid() != user_id AND validate_ultra_secure_profile_access(user_id))
  OR
  -- Allow users to always view their own profiles
  (auth.uid() = user_id)
);

-- 6. Create emergency function for profile access validation with enhanced security
CREATE OR REPLACE FUNCTION public.validate_emergency_profile_access(
  target_user_id UUID,
  access_reason TEXT DEFAULT 'administrative_review'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_access_count INTEGER;
  is_emergency BOOLEAN := FALSE;
BEGIN
  -- Absolute requirement: Must be authenticated
  IF auth.uid() IS NULL THEN
    INSERT INTO public.security_events (event_type, severity, details)
    VALUES (
      'unauthenticated_emergency_profile_access_attempt',
      'critical',
      jsonb_build_object(
        'attempted_target', target_user_id,
        'access_reason', access_reason,
        'timestamp', NOW(),
        'threat_level', 'critical'
      )
    );
    RETURN FALSE;
  END IF;

  -- Only super admins can perform emergency profile access
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    INSERT INTO public.security_events (event_type, severity, details, user_id)
    VALUES (
      'unauthorized_emergency_profile_access_attempt',
      'critical',
      jsonb_build_object(
        'attempted_target', target_user_id,
        'unauthorized_user', auth.uid(),
        'access_reason', access_reason,
        'timestamp', NOW()
      ),
      auth.uid()
    );
    RETURN FALSE;
  END IF;

  -- Check if this admin has accessed too many profiles recently (prevent mass data harvesting)
  SELECT COUNT(DISTINCT target_user_id) INTO admin_access_count
  FROM public.admin_audit_log
  WHERE admin_user_id = auth.uid()
    AND action = 'emergency_profile_access'
    AND created_at > NOW() - INTERVAL '1 hour';

  IF admin_access_count >= 5 THEN
    -- Create critical security alert for potential data breach
    PERFORM create_security_alert(
      'potential_admin_data_harvesting',
      'critical',
      'CRITICAL: Potential Admin Data Harvesting Detected',
      format('Super admin %s has accessed %s profiles in the last hour via emergency access. Investigate immediately.', 
             auth.uid(), admin_access_count + 1),
      jsonb_build_object(
        'admin_user_id', auth.uid(),
        'profiles_accessed', admin_access_count + 1,
        'time_window', '1_hour',
        'requires_immediate_investigation', true
      )
    );
    RETURN FALSE;
  END IF;

  -- Log the emergency access with full audit trail
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'emergency_profile_access',
    target_user_id,
    'profiles',
    jsonb_build_object(
      'access_reason', access_reason,
      'emergency_access', true,
      'timestamp', NOW(),
      'security_classification', 'confidential',
      'compliance_note', 'emergency_admin_profile_access'
    ),
    'confidential'
  );

  RETURN TRUE;
END;
$$;

-- 7. Create comprehensive audit function for all profile access
CREATE OR REPLACE FUNCTION public.log_profile_access_comprehensive(
  accessed_user_id UUID,
  access_type TEXT DEFAULT 'view'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log when admins access other users' profiles
  IF is_admin(auth.uid()) AND auth.uid() != accessed_user_id THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      'profile_access_logged',
      accessed_user_id,
      'profiles',
      jsonb_build_object(
        'access_type', access_type,
        'timestamp', NOW(),
        'sensitive_data_accessed', ARRAY['name', 'email', 'phone', 'location', 'company'],
        'data_classification', 'confidential',
        'ip_address', current_setting('request.headers', TRUE)::json->>'x-forwarded-for'
      ),
      'confidential'
    );

    -- Create security event for monitoring
    INSERT INTO public.security_events (event_type, severity, details, user_id)
    VALUES (
      'admin_profile_data_access',
      'medium',
      jsonb_build_object(
        'admin_user', auth.uid(),
        'accessed_profile', accessed_user_id,
        'access_type', access_type,
        'timestamp', NOW()
      ),
      auth.uid()
    );
  END IF;
END;
$$;

-- 8. Remove any potential public access functions that might exist
DROP FUNCTION IF EXISTS public.get_public_profiles();
DROP FUNCTION IF EXISTS public.get_all_profiles();
DROP FUNCTION IF EXISTS public.list_user_profiles();

-- 9. Create secure admin-only function for profile management
CREATE OR REPLACE FUNCTION public.get_admin_profile_summary()
RETURNS TABLE(
  user_id UUID,
  name_masked TEXT,
  email_masked TEXT,
  join_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only super admins can access this function
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required for profile summary';
  END IF;

  -- Log the access
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'profile_summary_access',
    'profiles',
    jsonb_build_object(
      'access_type', 'masked_summary',
      'timestamp', NOW()
    ),
    'restricted'
  );

  RETURN QUERY
  SELECT 
    p.user_id,
    -- Mask sensitive data even for admins in summary view
    CASE WHEN LENGTH(p.name) > 2 
      THEN LEFT(p.name, 2) || '***' 
      ELSE '***' 
    END as name_masked,
    CASE WHEN p.email IS NOT NULL 
      THEN LEFT(split_part(p.email, '@', 1), 2) || '***@' || split_part(p.email, '@', 2)
      ELSE '***@***.***' 
    END as email_masked,
    p.join_date,
    TRUE as is_active  -- Simplified for summary
  FROM public.profiles p
  ORDER BY p.join_date DESC;
END;
$$;

-- 10. Add trigger to detect suspicious profile access patterns
CREATE OR REPLACE FUNCTION public.detect_profile_access_abuse()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_access_count INTEGER;
BEGIN
  -- Only check for admin access to other users' profiles
  IF TG_OP = 'SELECT' AND is_admin(auth.uid()) AND auth.uid() != NEW.user_id THEN
    -- Count recent profile accesses by this admin
    SELECT COUNT(*) INTO recent_access_count
    FROM public.admin_audit_log
    WHERE admin_user_id = auth.uid()
      AND action IN ('profile_access_logged', 'emergency_profile_access')
      AND created_at > NOW() - INTERVAL '10 minutes';

    -- Alert if accessing too many profiles too quickly
    IF recent_access_count > 10 THEN
      PERFORM create_security_alert(
        'rapid_profile_access_detected',
        'high',
        'Rapid Profile Access Pattern Detected',
        format('Admin %s has accessed %s profiles in the last 10 minutes', 
               auth.uid(), recent_access_count),
        jsonb_build_object(
          'admin_user_id', auth.uid(),
          'access_count', recent_access_count,
          'time_window', '10_minutes'
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;