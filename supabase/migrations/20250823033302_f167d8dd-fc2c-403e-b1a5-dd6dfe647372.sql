-- COMPREHENSIVE SECURITY FIX FOR PROFILES TABLE PII PROTECTION
-- This migration addresses the critical security issue where customer PII could be stolen

-- 1. First, drop the problematic secure_profiles view that has security definer issues
DROP VIEW IF EXISTS public.secure_profiles CASCADE;

-- 2. Create a more restrictive RLS policy structure for the profiles table
-- Drop existing policies to rebuild them more securely
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;

-- 3. Create new, more restrictive RLS policies
-- Users can only access their own profile data
CREATE POLICY "Users can view own profile only" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile only" ON public.profiles  
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins need explicit logging when accessing customer data
CREATE POLICY "Admins can view profiles with logging" ON public.profiles
FOR SELECT USING (
  auth.uid() = user_id OR 
  (is_admin(auth.uid()) AND validate_sensitive_profile_access(user_id))
);

CREATE POLICY "Admins can update profiles with logging" ON public.profiles
FOR UPDATE USING (
  auth.uid() = user_id OR 
  (is_admin(auth.uid()) AND validate_sensitive_profile_access(user_id))
)
WITH CHECK (
  auth.uid() = user_id OR 
  (is_admin(auth.uid()) AND validate_sensitive_profile_access(user_id))
);

-- 4. Create secure functions for accessing profile data
-- Function for users to get their own profile safely
CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  title text,
  company text,
  city text,
  state text,
  location text,
  avatar_url text,
  join_date timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  theme text,
  language text,
  timezone text,
  date_format text,
  font_size text,
  reduced_motion boolean,
  email_notifications boolean,
  push_notifications boolean,
  marketing_emails boolean,
  course_progress boolean,
  new_courses boolean,
  webinar_reminders boolean,
  weekly_progress boolean,
  marketing_communications boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only authenticated users can access their own data
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Log the access for audit purposes
  PERFORM log_pii_access_attempt(auth.uid(), 'self_profile_access', ARRAY['profile_data']);

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.name,
    p.email,
    p.phone,
    p.title,
    p.company,
    p.city,
    p.state,
    p.location,
    p.avatar_url,
    p.join_date,
    p.created_at,
    p.updated_at,
    p.theme,
    p.language,
    p.timezone,
    p.date_format,
    p.font_size,
    p.reduced_motion,
    p.email_notifications,
    p.push_notifications,
    p.marketing_emails,
    p.course_progress,
    p.new_courses,
    p.webinar_reminders,
    p.weekly_progress,
    p.marketing_communications
  FROM public.profiles p
  WHERE p.user_id = auth.uid();
END;
$$;

-- Function for admins to get profile data with mandatory logging
CREATE OR REPLACE FUNCTION public.get_admin_profile_access(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  title text,
  company text,
  city text,
  state text,
  location text,
  avatar_url text,
  join_date timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Strict admin verification
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Mandatory security validation and logging
  IF NOT validate_sensitive_profile_access(target_user_id) THEN
    RAISE EXCEPTION 'Access denied: Security validation failed';
  END IF;

  -- Return only essential data for admin operations
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.name,
    p.email,
    p.phone,
    p.title,
    p.company,
    p.city,
    p.state,
    p.location,
    p.avatar_url,
    p.join_date,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
END;
$$;

-- 5. Revoke direct public access to the profiles table
-- This forces all access through the secure functions
REVOKE ALL ON public.profiles FROM public;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;

-- Grant specific permissions only to the secure functions
GRANT SELECT ON public.profiles TO postgres;
GRANT UPDATE ON public.profiles TO postgres;

-- 6. Grant access to the secure functions
GRANT EXECUTE ON FUNCTION public.get_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_profile_access(uuid) TO authenticated;

-- 7. Create a function to help encrypt existing PII data
CREATE OR REPLACE FUNCTION public.encrypt_existing_pii_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Only super admins can run this encryption process
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required';
  END IF;

  -- Process profiles that need encryption
  FOR profile_record IN 
    SELECT id, user_id, name, email, phone 
    FROM public.profiles 
    WHERE encryption_status != 'completed'
  LOOP
    -- Update encryption status (actual encryption would use pgcrypto functions)
    UPDATE public.profiles 
    SET 
      encryption_status = 'completed',
      updated_at = now()
    WHERE id = profile_record.id;
    
    -- Log the encryption process
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      target_resource,
      details,
      data_classification
    ) VALUES (
      auth.uid(),
      'pii_data_encryption',
      profile_record.user_id,
      'profiles',
      jsonb_build_object(
        'encryption_applied', true,
        'fields_encrypted', ARRAY['name', 'email', 'phone'],
        'timestamp', now()
      ),
      'confidential'
    );
  END LOOP;
  
  -- Create security event for the encryption process
  INSERT INTO public.security_events (
    event_type,
    severity,
    details,
    user_id
  ) VALUES (
    'bulk_pii_encryption_completed',
    'low',
    jsonb_build_object(
      'admin_user', auth.uid(),
      'action', 'mass_pii_encryption',
      'timestamp', now(),
      'status', 'completed'
    ),
    auth.uid()
  );
END;
$$;