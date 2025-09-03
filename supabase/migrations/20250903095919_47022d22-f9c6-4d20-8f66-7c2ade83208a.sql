-- Fix the RLS recursion by dropping and recreating the function properly

-- Drop the existing function that's causing issues
DROP FUNCTION IF EXISTS public.get_masked_user_profiles();

-- Drop problematic policies that cause recursion
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create simple, non-recursive policies for user_roles
CREATE POLICY "user_roles_self_access"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- Create a completely new function with proper return type
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
  -- Simple admin check without recursion
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
    AND ur.is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return profiles with fully qualified column names to avoid ambiguity
  RETURN QUERY
  SELECT 
    p.user_id::uuid,
    p.name::text,
    p.email::text, 
    p.phone::text,
    p.company::text,
    p.created_at::timestamp with time zone,
    true::boolean as is_masked
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