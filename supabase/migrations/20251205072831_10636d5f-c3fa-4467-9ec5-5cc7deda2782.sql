-- Clean up redundant RLS policies on profiles table
DROP POLICY IF EXISTS "profiles_self_view_v3" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_view_v3" ON profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a secure function to mask PII for admin views
CREATE OR REPLACE FUNCTION public.mask_profile_pii(
  p_name text,
  p_email text,
  p_phone text,
  p_viewer_id uuid,
  p_profile_user_id uuid
)
RETURNS TABLE (
  masked_name text,
  masked_email text,
  masked_phone text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If viewer is the profile owner, return unmasked data
  IF p_viewer_id = p_profile_user_id THEN
    RETURN QUERY SELECT p_name, p_email, p_phone;
    RETURN;
  END IF;
  
  -- For admins, return masked data
  RETURN QUERY SELECT 
    CASE 
      WHEN p_name IS NULL THEN NULL
      WHEN LENGTH(p_name) <= 2 THEN '**'
      ELSE SUBSTRING(p_name, 1, 1) || REPEAT('*', LENGTH(p_name) - 2) || SUBSTRING(p_name, LENGTH(p_name), 1)
    END,
    CASE 
      WHEN p_email IS NULL THEN NULL
      WHEN POSITION('@' IN p_email) <= 2 THEN '***@' || SPLIT_PART(p_email, '@', 2)
      ELSE SUBSTRING(p_email, 1, 2) || REPEAT('*', POSITION('@' IN p_email) - 3) || SUBSTRING(p_email, POSITION('@' IN p_email) - 1)
    END,
    CASE 
      WHEN p_phone IS NULL THEN NULL
      WHEN LENGTH(p_phone) <= 4 THEN '****'
      ELSE REPEAT('*', LENGTH(p_phone) - 4) || SUBSTRING(p_phone, LENGTH(p_phone) - 3)
    END;
END;
$$;

-- Create a secure view for admin profile access with automatic PII masking
CREATE OR REPLACE FUNCTION public.get_profile_for_admin(p_profile_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  location text,
  title text,
  company text,
  avatar_url text,
  created_at timestamptz,
  data_classification data_classification
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_viewer_id uuid := auth.uid();
  v_is_super_admin boolean;
BEGIN
  -- Check if viewer is super admin (full access) or regular admin (masked access)
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = v_viewer_id 
    AND role = 'super_admin' 
    AND is_active = true
  ) INTO v_is_super_admin;
  
  -- Log access attempt
  INSERT INTO admin_audit_log (admin_user_id, action, target_user_id, details)
  VALUES (v_viewer_id, 'VIEW_PROFILE', p_profile_user_id, jsonb_build_object(
    'access_type', CASE WHEN v_is_super_admin THEN 'full' ELSE 'masked' END,
    'timestamp', now()
  ));
  
  -- Return data with appropriate masking
  IF v_is_super_admin THEN
    RETURN QUERY SELECT 
      p.id, p.user_id, p.name, p.email, p.phone, p.location,
      p.title, p.company, p.avatar_url, p.created_at, p.data_classification
    FROM profiles p WHERE p.user_id = p_profile_user_id;
  ELSE
    RETURN QUERY SELECT 
      p.id, p.user_id,
      (SELECT masked_name FROM mask_profile_pii(p.name, p.email, p.phone, v_viewer_id, p.user_id)),
      (SELECT masked_email FROM mask_profile_pii(p.name, p.email, p.phone, v_viewer_id, p.user_id)),
      (SELECT masked_phone FROM mask_profile_pii(p.name, p.email, p.phone, v_viewer_id, p.user_id)),
      p.location, p.title, p.company, p.avatar_url, p.created_at, p.data_classification
    FROM profiles p WHERE p.user_id = p_profile_user_id;
  END IF;
END;
$$;

-- Update the data classification for profiles to 'restricted'
UPDATE profiles SET data_classification = 'restricted' WHERE data_classification IS NULL;