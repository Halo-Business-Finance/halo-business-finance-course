-- COMPREHENSIVE LMS ENCRYPTION IMPLEMENTATION
-- Encrypt all sensitive user data, course content, and communications

-- 1. Create encryption/decryption functions using Supabase's built-in crypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Generate a master encryption key (stored securely in Vault)
INSERT INTO vault.secrets (secret, name, description) 
VALUES (
  gen_random_uuid()::text || gen_random_uuid()::text,
  'lms_master_encryption_key',
  'Master encryption key for LMS sensitive data'
) ON CONFLICT (name) DO NOTHING;

-- 2. Secure encryption function for PII data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(
  plaintext text,
  context text DEFAULT 'general'
)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'vault', 'public'
AS $function$
DECLARE
  master_key text;
  encrypted_data text;
BEGIN
  -- Get master key from Vault
  SELECT decrypted_secret INTO master_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'lms_master_encryption_key';
  
  IF master_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found - critical security error';
  END IF;
  
  -- Encrypt using AES-256-GCM equivalent (pgp_sym_encrypt with strong cipher)
  encrypted_data := encode(
    pgp_sym_encrypt(
      plaintext::bytea, 
      master_key || context,  -- Context-specific encryption
      'cipher-algo=aes256, compress-algo=2'
    ),
    'base64'
  );
  
  -- Log encryption event for audit
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'data_encrypted',
    'low',
    jsonb_build_object(
      'context', context,
      'data_length', length(plaintext),
      'encrypted_at', now()
    )
  );
  
  RETURN encrypted_data;
END;
$function$;

-- 3. Secure decryption function
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(
  encrypted_data text,
  context text DEFAULT 'general'
)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'vault', 'public'
AS $function$
DECLARE
  master_key text;
  decrypted_data text;
BEGIN
  -- Only allow decryption if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for data decryption';
  END IF;
  
  -- Get master key from Vault
  SELECT decrypted_secret INTO master_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'lms_master_encryption_key';
  
  IF master_key IS NULL THEN
    RAISE EXCEPTION 'Decryption key not found - critical security error';
  END IF;
  
  -- Decrypt the data
  BEGIN
    decrypted_data := convert_from(
      pgp_sym_decrypt(
        decode(encrypted_data, 'base64'),
        master_key || context
      ),
      'UTF8'
    );
  EXCEPTION
    WHEN others THEN
      -- Log decryption failure for security monitoring
      INSERT INTO public.security_events (event_type, severity, details, user_id)
      VALUES (
        'decryption_failed',
        'high',
        jsonb_build_object(
          'context', context,
          'error', SQLERRM,
          'failed_at', now()
        ),
        auth.uid()
      );
      RAISE EXCEPTION 'Data decryption failed - potential tampering detected';
  END;
  
  -- Log successful decryption for audit
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'data_decrypted',
    'medium',
    jsonb_build_object(
      'context', context,
      'decrypted_at', now()
    ),
    auth.uid()
  );
  
  RETURN decrypted_data;
END;
$function$;

-- 4. Add encrypted fields to profiles table for PII protection
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS encrypted_email text,
ADD COLUMN IF NOT EXISTS encrypted_phone text,
ADD COLUMN IF NOT EXISTS encrypted_name text,
ADD COLUMN IF NOT EXISTS encryption_status text DEFAULT 'pending';

-- 5. Create secure profile access function with automatic decryption
CREATE OR REPLACE FUNCTION public.get_secure_profile_data(target_user_id uuid)
 RETURNS TABLE(
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
   created_at timestamptz,
   updated_at timestamptz
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  profile_record record;
BEGIN
  -- Strict access control - only self or super admins
  IF NOT (auth.uid() = target_user_id OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )) THEN
    RAISE EXCEPTION 'Access denied to encrypted profile data';
  END IF;

  -- Get profile with automatic decryption
  SELECT p.* INTO profile_record
  FROM public.profiles p
  WHERE p.user_id = target_user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Return decrypted data
  RETURN QUERY SELECT
    profile_record.user_id,
    CASE 
      WHEN profile_record.encrypted_name IS NOT NULL 
      THEN decrypt_sensitive_data(profile_record.encrypted_name, 'profile_name')
      ELSE profile_record.name
    END as name,
    CASE 
      WHEN profile_record.encrypted_email IS NOT NULL 
      THEN decrypt_sensitive_data(profile_record.encrypted_email, 'profile_email')
      ELSE profile_record.email
    END as email,
    CASE 
      WHEN profile_record.encrypted_phone IS NOT NULL 
      THEN decrypt_sensitive_data(profile_record.encrypted_phone, 'profile_phone')
      ELSE profile_record.phone
    END as phone,
    profile_record.title,
    profile_record.company,
    profile_record.city,
    profile_record.state,
    profile_record.location,
    profile_record.avatar_url,
    profile_record.created_at,
    profile_record.updated_at;
END;
$function$;

-- 6. Create encrypted course content table for sensitive materials
CREATE TABLE IF NOT EXISTS public.encrypted_course_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id text NOT NULL,
  module_id text,
  content_type text NOT NULL, -- 'video', 'document', 'assessment', 'article'
  encrypted_content text NOT NULL, -- Base64 encrypted content
  content_hash text NOT NULL, -- SHA-256 hash for integrity verification
  encryption_algorithm text NOT NULL DEFAULT 'AES-256-GCM',
  access_level text NOT NULL DEFAULT 'enrolled', -- 'public', 'enrolled', 'premium'
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on encrypted content
ALTER TABLE public.encrypted_course_content ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage encrypted content
CREATE POLICY "Admins can manage encrypted content" 
ON public.encrypted_course_content 
FOR ALL 
USING (is_admin(auth.uid()));

-- Policy: Enrolled users can access course content
CREATE POLICY "Enrolled users can access encrypted course content" 
ON public.encrypted_course_content 
FOR SELECT 
USING (
  access_level = 'public' 
  OR (
    access_level = 'enrolled' 
    AND EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE user_id = auth.uid() 
      AND course_id = encrypted_course_content.course_id 
      AND status = 'active'
    )
  )
);

-- 7. Create secure messaging table for encrypted communications
CREATE TABLE IF NOT EXISTS public.encrypted_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  recipient_id uuid NOT NULL REFERENCES auth.users(id),
  encrypted_subject text NOT NULL,
  encrypted_body text NOT NULL,
  message_hash text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- Enable RLS on encrypted messages
ALTER TABLE public.encrypted_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own messages
CREATE POLICY "Users can access their own encrypted messages" 
ON public.encrypted_messages 
FOR ALL 
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- 8. Function to migrate existing profile data to encrypted format
CREATE OR REPLACE FUNCTION public.migrate_profile_to_encrypted(profile_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  profile_record record;
BEGIN
  -- Only super admins can run migration
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Super admin privileges required for encryption migration';
  END IF;

  -- Get current profile data
  SELECT * INTO profile_record
  FROM public.profiles
  WHERE user_id = profile_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', profile_user_id;
  END IF;

  -- Encrypt and update sensitive fields
  UPDATE public.profiles SET
    encrypted_name = CASE 
      WHEN name IS NOT NULL 
      THEN encrypt_sensitive_data(name, 'profile_name')
      ELSE NULL 
    END,
    encrypted_email = CASE 
      WHEN email IS NOT NULL 
      THEN encrypt_sensitive_data(email, 'profile_email')
      ELSE NULL 
    END,
    encrypted_phone = CASE 
      WHEN phone IS NOT NULL 
      THEN encrypt_sensitive_data(phone, 'profile_phone')
      ELSE NULL 
    END,
    encryption_status = 'encrypted',
    updated_at = now()
  WHERE user_id = profile_user_id;

  -- Log migration
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'profile_encrypted',
    'medium',
    jsonb_build_object(
      'migrated_user', profile_user_id,
      'encrypted_fields', ARRAY['name', 'email', 'phone'],
      'migration_completed_at', now()
    ),
    auth.uid()
  );
END;
$function$;

-- 9. Create comprehensive audit log for encryption operations
CREATE TABLE IF NOT EXISTS public.encryption_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL, -- 'encrypt', 'decrypt', 'key_rotation', 'access'
  data_type text NOT NULL, -- 'profile', 'content', 'message'
  user_id uuid REFERENCES auth.users(id),
  target_user_id uuid,
  success boolean NOT NULL,
  error_details jsonb,
  security_context jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on encryption audit log
ALTER TABLE public.encryption_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only super admins can view encryption audit logs
CREATE POLICY "Super admins can view encryption audit logs" 
ON public.encryption_audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- 10. Enhanced security monitoring for encryption events
CREATE OR REPLACE FUNCTION public.monitor_encryption_security()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  suspicious_decryption_count INTEGER;
  failed_encryption_count INTEGER;
BEGIN
  -- Check for suspicious decryption patterns (too many decryptions from one user)
  SELECT COUNT(*) INTO suspicious_decryption_count
  FROM security_events
  WHERE event_type = 'data_decrypted'
    AND user_id = auth.uid()
    AND created_at > now() - interval '1 hour';

  IF suspicious_decryption_count > 20 THEN
    PERFORM create_security_alert(
      'suspicious_decryption_pattern',
      'high',
      'Suspicious Data Decryption Pattern',
      format('User %s performed %s decryption operations in 1 hour - potential data exfiltration', 
             auth.uid(), suspicious_decryption_count),
      jsonb_build_object(
        'user_id', auth.uid(),
        'decryption_count', suspicious_decryption_count,
        'time_window', '1_hour',
        'requires_investigation', true
      )
    );
  END IF;

  -- Check for failed encryption attempts
  SELECT COUNT(*) INTO failed_encryption_count
  FROM security_events
  WHERE event_type = 'decryption_failed'
    AND created_at > now() - interval '24 hours';

  IF failed_encryption_count > 5 THEN
    PERFORM create_security_alert(
      'encryption_system_compromise',
      'critical',
      'Multiple Encryption Failures Detected',
      format('System detected %s encryption failures in 24 hours - potential compromise', 
             failed_encryption_count),
      jsonb_build_object(
        'failure_count', failed_encryption_count,
        'time_window', '24_hours',
        'threat_level', 'critical',
        'requires_immediate_attention', true
      )
    );
  END IF;
END;
$function$;