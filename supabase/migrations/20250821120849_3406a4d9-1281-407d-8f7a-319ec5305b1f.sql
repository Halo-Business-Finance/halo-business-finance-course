-- Clean up duplicate SELECT policies on profiles table
-- Keep only the enhanced security policy

DROP POLICY IF EXISTS "Users can only view their own profile data" ON public.profiles;
DROP POLICY IF EXISTS "Verified admins can view profiles with mandatory audit logging" ON public.profiles;

-- Verify our enhanced policy is the only SELECT policy remaining
-- This policy provides comprehensive logging and security controls