-- Phase 2: Database Security Hardening - Fix Function Search Paths

-- Fix search_path for security functions that are missing it
-- This prevents search path manipulation attacks

-- Update existing functions to include proper search_path settings
CREATE OR REPLACE FUNCTION public.get_authenticated_user_profiles()
RETURNS TABLE(id uuid, user_id uuid, name text, title text, company text, city text, state text, avatar_url text, join_date timestamp with time zone, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- ABSOLUTE REQUIREMENT: User must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'SECURITY VIOLATION: Unauthenticated access to customer data is forbidden'
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
      SELECT public.log_pii_access_comprehensive(p.user_id, 'admin_profile_access', ARRAY['name', 'title', 'company', 'city', 'state'], 'admin_dashboard') IS NOT NULL OR true
    ));
END;
$$;

-- Update get_profiles_with_roles function
CREATE OR REPLACE FUNCTION public.get_profiles_with_roles()
RETURNS TABLE(user_id uuid, profile_name text, profile_email text, profile_phone text, profile_title text, profile_company text, profile_city text, profile_state text, profile_join_date timestamp with time zone, profile_created_at timestamp with time zone, profile_updated_at timestamp with time zone, role text, role_id uuid, role_is_active boolean, role_created_at timestamp with time zone, role_updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Log admin access to all profiles with enhanced logging
  PERFORM log_pii_access_comprehensive(
    NULL, -- Accessing multiple users
    'bulk_admin_dashboard_access',
    ARRAY['name', 'email', 'phone', 'title', 'company', 'city', 'state'],
    'admin_dashboard_user_management'
  );

  -- Return profiles with their roles using direct table access (no view needed)
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
    ur.role,
    ur.id as role_id,
    ur.is_active as role_is_active,
    ur.created_at as role_created_at,
    ur.updated_at as role_updated_at
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
  ORDER BY p.created_at DESC;
END;
$$;

-- Update get_safe_user_profiles function  
CREATE OR REPLACE FUNCTION public.get_safe_user_profiles()
RETURNS TABLE(id uuid, user_id uuid, name text, email text, phone text, title text, company text, city text, state text, avatar_url text, join_date timestamp with time zone, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Log the access attempt with comprehensive logging
  PERFORM log_pii_access_comprehensive(
    auth.uid(), 
    'safe_profile_view', 
    ARRAY['name', 'email', 'phone', 'title', 'company'],
    'user_self_access'
  );
  
  -- Return only the user's own data - no view needed, direct table access
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
    p.avatar_url,
    p.join_date,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = auth.uid();
END;
$$;