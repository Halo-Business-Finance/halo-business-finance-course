-- COMPREHENSIVE SECURITY FIX FOR PROFILES TABLE PII PROTECTION
-- This migration addresses the security vulnerability where customer PII could be exposed

-- 1. Create secure view for profiles with automatic PII masking
CREATE OR REPLACE VIEW public.secure_profiles AS
SELECT 
  id,
  user_id,
  -- Mask sensitive fields based on access rights
  CASE 
    WHEN auth.uid() = user_id OR is_admin(auth.uid()) THEN name
    ELSE '***'
  END AS name,
  CASE 
    WHEN auth.uid() = user_id OR is_admin(auth.uid()) THEN email
    ELSE '***@***.***'
  END AS email,
  CASE 
    WHEN auth.uid() = user_id OR is_admin(auth.uid()) THEN phone
    ELSE '***-***-****'
  END AS phone,
  -- Non-sensitive fields remain visible
  title,
  company,
  city,
  state,
  location,
  avatar_url,
  join_date,
  created_at,
  updated_at,
  theme,
  language,
  timezone,
  date_format,
  font_size,
  reduced_motion,
  email_notifications,
  push_notifications,
  marketing_emails,
  course_progress,
  new_courses,
  webinar_reminders,
  weekly_progress,
  marketing_communications,
  data_classification,
  encryption_status
FROM public.profiles
WHERE 
  -- Users can only see their own data or admins can see all
  auth.uid() = user_id OR is_admin(auth.uid());

-- 2. Enable security barrier on the secure view
ALTER VIEW public.secure_profiles SET (security_barrier = true);

-- 3. Create function to log PII access attempts
CREATE OR REPLACE FUNCTION public.log_pii_access_attempt(
  accessed_user_id uuid,
  access_type text,
  fields_accessed text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all PII access attempts for security monitoring
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details
  ) VALUES (
    auth.uid(),
    'pii_access_attempt',
    CASE 
      WHEN auth.uid() = accessed_user_id THEN 'low'
      WHEN is_admin(auth.uid()) THEN 'medium'
      ELSE 'critical'
    END,
    jsonb_build_object(
      'accessed_user_id', accessed_user_id,
      'access_type', access_type,
      'fields_accessed', fields_accessed,
      'timestamp', now(),
      'authorized', auth.uid() = accessed_user_id OR is_admin(auth.uid())
    )
  );
  
  -- Create security alert for unauthorized access attempts
  IF NOT (auth.uid() = accessed_user_id OR is_admin(auth.uid())) THEN
    PERFORM create_security_alert(
      'unauthorized_pii_access',
      'critical',
      'Unauthorized PII Access Attempt',
      format('User %s attempted to access PII for user %s', auth.uid(), accessed_user_id),
      jsonb_build_object(
        'unauthorized_user', auth.uid(),
        'target_user', accessed_user_id,
        'fields_attempted', fields_accessed,
        'requires_investigation', true
      )
    );
  END IF;
END;
$$;

-- 4. Create function for safe profile retrieval (to be used by frontend)
CREATE OR REPLACE FUNCTION public.get_safe_user_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
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
SET search_path = public
AS $$
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Log the access attempt
  PERFORM log_pii_access_attempt(auth.uid(), 'profile_view', ARRAY['profile_data']);
  
  -- Return data from secure view
  RETURN QUERY
  SELECT 
    sp.id,
    sp.user_id,
    sp.name,
    sp.email,
    sp.phone,
    sp.title,
    sp.company,
    sp.city,
    sp.state,
    sp.avatar_url,
    sp.join_date,
    sp.created_at
  FROM public.secure_profiles sp
  WHERE sp.user_id = auth.uid();
END;
$$;

-- 5. Update the existing admin function to use enhanced logging
CREATE OR REPLACE FUNCTION public.get_profiles_with_roles()
RETURNS TABLE (
  user_id uuid,
  profile_name text,
  profile_email text,
  profile_phone text,
  profile_title text,
  profile_company text,
  profile_city text,
  profile_state text,
  profile_join_date timestamp with time zone,
  profile_created_at timestamp with time zone,
  profile_updated_at timestamp with time zone,
  role text,
  role_id uuid,
  role_is_active boolean,
  role_created_at timestamp with time zone,
  role_updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Log admin access to all profiles
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_resource,
    details,
    data_classification
  ) VALUES (
    auth.uid(),
    'bulk_profile_access_admin_dashboard',
    'profiles_with_roles',
    jsonb_build_object(
      'access_type', 'admin_dashboard_view',
      'timestamp', now(),
      'justification', 'admin_dashboard_user_management'
    ),
    'confidential'
  );

  -- Return profiles with their roles using secure view
  RETURN QUERY
  SELECT 
    sp.user_id,
    sp.name as profile_name,
    sp.email as profile_email,
    sp.phone as profile_phone,
    sp.title as profile_title,
    sp.company as profile_company,
    sp.city as profile_city,
    sp.state as profile_state,
    sp.join_date as profile_join_date,
    sp.created_at as profile_created_at,
    sp.updated_at as profile_updated_at,
    ur.role,
    ur.id as role_id,
    ur.is_active as role_is_active,
    ur.created_at as role_created_at,
    ur.updated_at as role_updated_at
  FROM public.secure_profiles sp
  LEFT JOIN public.user_roles ur ON sp.user_id = ur.user_id
  ORDER BY sp.created_at DESC;
END;
$$;

-- 6. Create additional security monitoring for bulk access
CREATE OR REPLACE FUNCTION public.monitor_bulk_pii_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  suspicious_access RECORD;
BEGIN
  -- Check for suspicious bulk PII access in the last hour
  FOR suspicious_access IN
    SELECT 
      user_id,
      COUNT(*) as access_count,
      array_agg(DISTINCT (details->>'accessed_user_id')) as accessed_users
    FROM public.security_events
    WHERE event_type = 'pii_access_attempt'
      AND created_at > now() - interval '1 hour'
      AND user_id != (details->>'accessed_user_id')::uuid  -- Exclude self-access
    GROUP BY user_id
    HAVING COUNT(*) > 10  -- More than 10 different user PII accesses
  LOOP
    -- Create critical security alert
    PERFORM create_security_alert(
      'bulk_pii_access_detected',
      'critical',
      'Bulk Customer PII Access Detected',
      format('User %s accessed PII for %s different users in the last hour. Potential data breach.', 
             suspicious_access.user_id, array_length(suspicious_access.accessed_users, 1)),
      jsonb_build_object(
        'accessing_user', suspicious_access.user_id,
        'access_count', suspicious_access.access_count,
        'affected_users', suspicious_access.accessed_users,
        'time_window', '1_hour',
        'threat_level', 'critical'
      )
    );
  END LOOP;
END;
$$;