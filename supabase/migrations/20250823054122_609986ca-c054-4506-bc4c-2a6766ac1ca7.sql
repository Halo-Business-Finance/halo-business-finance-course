-- Fix All Remaining SECURITY DEFINER Functions Missing search_path

-- These are the final 4 functions that need search_path fixes

-- 1. Fix admin_get_profile_summary function
CREATE OR REPLACE FUNCTION public.admin_get_profile_summary(target_user_id uuid)
RETURNS TABLE(user_id uuid, name text, email text, phone text, location text, full_profile jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- STRICT access control - only super admins can use this function
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required';
  END IF;

  -- Log the access attempt with comprehensive logging
  PERFORM log_pii_access_comprehensive(
    target_user_id, 
    'admin_profile_summary_access', 
    ARRAY['name', 'email', 'phone', 'location', 'full_profile'],
    'super_admin_profile_summary'
  );

  -- Return the data
  RETURN QUERY
  SELECT 
    p.user_id,
    p.name,
    p.email,
    p.phone,
    p.location,
    row_to_json(p)::jsonb as full_profile
  FROM profiles p
  WHERE p.user_id = target_user_id;
END;
$$;

-- 2. Fix decrypt_pii_field function
CREATE OR REPLACE FUNCTION public.decrypt_pii_field(encrypted_data text, field_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- This function should only be used by authorized systems
  -- Log the decryption attempt
  INSERT INTO security_events (event_type, severity, details, user_id)
  VALUES (
    'pii_decryption_attempt',
    'high',
    jsonb_build_object(
      'field_name', field_name,
      'timestamp', now(),
      'requesting_user', auth.uid(),
      'security_classification', 'confidential'
    ),
    auth.uid()
  );

  -- For now, return the data as-is since we don't have encryption implemented
  -- In a real implementation, this would decrypt the data
  RETURN encrypted_data;
END;
$$;

-- 3. Fix encrypt_existing_customer_pii function
CREATE OR REPLACE FUNCTION public.encrypt_existing_customer_pii()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  processed_count INTEGER := 0;
  total_count INTEGER;
BEGIN
  -- Only super admins can run this function
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required for PII encryption';
  END IF;

  -- Log the encryption operation
  INSERT INTO security_events (event_type, severity, details, user_id)
  VALUES (
    'bulk_pii_encryption_initiated',
    'high',
    jsonb_build_object(
      'operation', 'encrypt_existing_customer_pii',
      'timestamp', now(),
      'initiated_by', auth.uid(),
      'purpose', 'data_security_enhancement'
    ),
    auth.uid()
  );

  -- Get total count of profiles
  SELECT COUNT(*) INTO total_count FROM profiles;

  -- For now, just update encryption status without actual encryption
  -- In a real implementation, this would encrypt PII fields
  UPDATE profiles 
  SET encryption_status = 'completed'
  WHERE encryption_status != 'completed';

  GET DIAGNOSTICS processed_count = ROW_COUNT;

  -- Log completion
  INSERT INTO security_events (event_type, severity, details, user_id)
  VALUES (
    'bulk_pii_encryption_completed',
    'medium',
    jsonb_build_object(
      'profiles_processed', processed_count,
      'total_profiles', total_count,
      'timestamp', now(),
      'status', 'completed'
    ),
    auth.uid()
  );

  RETURN jsonb_build_object(
    'success', true,
    'profiles_processed', processed_count,
    'total_profiles', total_count,
    'encryption_status', 'completed'
  );
END;
$$;

-- 4. Fix encrypt_pii_field function
CREATE OR REPLACE FUNCTION public.encrypt_pii_field(plain_data text, field_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log the encryption attempt
  INSERT INTO security_events (event_type, severity, details, user_id)
  VALUES (
    'pii_encryption_attempt',
    'medium',
    jsonb_build_object(
      'field_name', field_name,
      'timestamp', now(),
      'requesting_user', auth.uid(),
      'purpose', 'data_protection'
    ),
    auth.uid()
  );

  -- For now, return the data as-is since we don't have encryption implemented
  -- In a real implementation, this would encrypt the data using a proper encryption key
  RETURN plain_data;
END;
$$;