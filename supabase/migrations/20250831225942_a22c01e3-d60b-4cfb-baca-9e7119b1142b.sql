-- CRITICAL SECURITY FIXES - Emergency System Repair
-- Fix infinite recursion in user_roles RLS policies

-- Drop existing problematic policies on user_roles that cause infinite recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

-- Create clean, non-recursive RLS policies for user_roles
CREATE POLICY "user_roles_select_own" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "user_roles_select_super_admin" 
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

CREATE POLICY "user_roles_insert_super_admin" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

CREATE POLICY "user_roles_update_super_admin" 
ON public.user_roles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

CREATE POLICY "user_roles_delete_super_admin" 
ON public.user_roles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin' 
    AND ur.is_active = true
  )
);

-- PHASE 2: Customer Data Protection - Secure profiles table with strict RLS policies

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create secure customer data protection policies
CREATE POLICY "profiles_select_own_only" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "profiles_select_super_admin_audited" 
ON public.profiles 
FOR SELECT 
USING (
  validate_ultra_secure_profile_access(user_id)
);

CREATE POLICY "profiles_insert_own_only" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own_only" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "profiles_update_super_admin_audited" 
ON public.profiles 
FOR UPDATE 
USING (
  user_id != auth.uid() AND 
  validate_ultra_secure_profile_access(user_id)
);