-- =====================================================
-- MINIMAL CRITICAL FIX: Update Authorization Functions Only
-- =====================================================
-- This migration only fixes the is_admin() and is_super_admin() functions
-- It does not recreate policies that may already exist

-- Fix is_admin() to properly check the user_roles table
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = COALESCE(check_user_id, auth.uid())
      AND role IN ('admin', 'super_admin')
      AND is_active = true
  );
$$;

-- Create is_super_admin function
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = COALESCE(check_user_id, auth.uid())
      AND role = 'super_admin'
      AND is_active = true
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, anon;