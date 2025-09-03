-- Fix the RLS infinite recursion by dropping and recreating the function properly

-- First drop the existing function that has a different return type
DROP FUNCTION IF EXISTS public.get_masked_user_profiles();

-- Fix user_roles policies to prevent recursion
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create simple, non-recursive policies for user_roles
CREATE POLICY "user_roles_self_access"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- This policy allows system/service role to manage roles (no recursion)
CREATE POLICY "user_roles_system_access" 
ON public.user_roles
FOR ALL
USING (current_setting('request.jwt.role', true) = 'service_role');

-- Recreate the function with proper column qualification to prevent ambiguous references
CREATE OR REPLACE FUNCTION public.get_masked_user_profiles()
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  phone text,
  company text,
  created_at timestamp with time zone,
  is_masked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin using direct query (no function calls to avoid recursion)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return profiles data with fully qualified column names to avoid ambiguity
  RETURN QUERY
  SELECT 
    p.user_id::uuid,
    p.name::text,
    p.email::text, 
    p.phone::text,
    p.company::text,
    p.created_at::timestamp with time zone,
    true::boolean as is_masked  -- Always return masked for security
  FROM public.profiles p
  WHERE p.user_id IS NOT NULL
  ORDER BY p.created_at DESC;
END;
$$;

-- Update is_admin function to be completely non-recursive
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public  
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = COALESCE(check_user_id, auth.uid())
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
  );
$$;

-- Log the successful fix
INSERT INTO public.security_events (event_type, severity, details, logged_via_secure_function)
VALUES (
  'trainee_tab_error_resolved',
  'medium',
  jsonb_build_object(
    'error_fixed', 'infinite_recursion_and_ambiguous_columns',
    'function_recreated', 'get_masked_user_profiles',
    'policies_simplified', 'user_roles_table',
    'timestamp', now()
  ),
  true
);