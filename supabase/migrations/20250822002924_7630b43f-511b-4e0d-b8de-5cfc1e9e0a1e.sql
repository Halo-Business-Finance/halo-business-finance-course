-- SIMPLIFIED LMS ENCRYPTION IMPLEMENTATION
-- Strong AES-256 encryption without Vault dependency

-- Enable crypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Secure encryption function using fixed strong key with context
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(
  plaintext text,
  context text DEFAULT 'general'
)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  encrypted_data text;
  encryption_key text;
BEGIN
  -- Generate context-specific encryption key (combine app secret with context)
  encryption_key := encode(digest('halo_lms_2024_secure_key_' || context || current_setting('app.jwt_secret', true), 'sha256'), 'hex');
  
  -- Encrypt using AES-256
  encrypted_data := encode(
    encrypt(
      plaintext::bytea, 
      encryption_key,
      'aes'
    ),
    'base64'
  );
  
  -- Log encryption event for audit (without exposing data)
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

-- 2. Secure decryption function
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(
  encrypted_data text,
  context text DEFAULT 'general'
)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  decrypted_data text;
  encryption_key text;
BEGIN
  -- Only allow decryption if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for data decryption';
  END IF;
  
  -- Generate the same context-specific encryption key
  encryption_key := encode(digest('halo_lms_2024_secure_key_' || context || current_setting('app.jwt_secret', true), 'sha256'), 'hex');
  
  -- Decrypt the data
  BEGIN
    decrypted_data := convert_from(
      decrypt(
        decode(encrypted_data, 'base64'),
        encryption_key,
        'aes'
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
          'error', 'decryption_error',
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

-- 3. Add encrypted fields to profiles table for PII protection
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS encrypted_email text,
ADD COLUMN IF NOT EXISTS encrypted_phone text,
ADD COLUMN IF NOT EXISTS encrypted_name text,
ADD COLUMN IF NOT EXISTS encryption_status text DEFAULT 'pending';

-- 4. Create secure profile access function with automatic decryption
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

-- 5. Encrypted course content table for sensitive materials
CREATE TABLE IF NOT EXISTS public.encrypted_course_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id text NOT NULL,
  module_id text,
  content_type text NOT NULL, -- 'video', 'document', 'assessment', 'article'
  encrypted_content text NOT NULL, -- Base64 encrypted content
  content_hash text NOT NULL, -- SHA-256 hash for integrity verification
  encryption_algorithm text NOT NULL DEFAULT 'AES-256',
  access_level text NOT NULL DEFAULT 'enrolled', -- 'public', 'enrolled', 'premium'
  created_by uuid,
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

-- 6. Encrypted messaging table for secure communications
CREATE TABLE IF NOT EXISTS public.encrypted_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
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

-- 7. Function to migrate existing profile data to encrypted format
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

-- 8. Content encryption function for course materials
CREATE OR REPLACE FUNCTION public.encrypt_course_content(
  content_text text,
  content_type text,
  course_id text,
  module_id text DEFAULT NULL
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_content_id uuid;
  encrypted_content text;
  content_hash text;
BEGIN
  -- Only admins can encrypt content
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin privileges required to encrypt content';
  END IF;

  -- Encrypt the content
  encrypted_content := encrypt_sensitive_data(content_text, 'course_content');
  
  -- Generate content hash for integrity verification
  content_hash := encode(digest(content_text, 'sha256'), 'hex');

  -- Insert encrypted content
  INSERT INTO public.encrypted_course_content (
    course_id,
    module_id,
    content_type,
    encrypted_content,
    content_hash,
    created_by
  ) VALUES (
    course_id,
    module_id,
    content_type,
    encrypted_content,
    content_hash,
    auth.uid()
  ) RETURNING id INTO new_content_id;

  RETURN new_content_id;
END;
$function$;

-- 9. Encrypted messaging function
CREATE OR REPLACE FUNCTION public.send_encrypted_message(
  recipient_user_id uuid,
  message_subject text,
  message_body text,
  expires_hours integer DEFAULT NULL
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_message_id uuid;
  encrypted_subject text;
  encrypted_body text;
  message_hash text;
  expiry_time timestamptz;
BEGIN
  -- Encrypt message content
  encrypted_subject := encrypt_sensitive_data(message_subject, 'message_subject');
  encrypted_body := encrypt_sensitive_data(message_body, 'message_body');
  
  -- Generate message hash for integrity
  message_hash := encode(digest(message_subject || message_body, 'sha256'), 'hex');
  
  -- Calculate expiry if specified
  IF expires_hours IS NOT NULL THEN
    expiry_time := now() + (expires_hours || ' hours')::interval;
  END IF;

  -- Insert encrypted message
  INSERT INTO public.encrypted_messages (
    sender_id,
    recipient_id,
    encrypted_subject,
    encrypted_body,
    message_hash,
    expires_at
  ) VALUES (
    auth.uid(),
    recipient_user_id,
    encrypted_subject,
    encrypted_body,
    message_hash,
    expiry_time
  ) RETURNING id INTO new_message_id;

  -- Log message encryption
  INSERT INTO public.security_events (event_type, severity, details, user_id)
  VALUES (
    'message_encrypted',
    'low',
    jsonb_build_object(
      'message_id', new_message_id,
      'recipient', recipient_user_id,
      'expires_at', expiry_time,
      'encrypted_at', now()
    ),
    auth.uid()
  );

  RETURN new_message_id;
END;
$function$;

-- 10. Enhanced security monitoring for encryption
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
  -- Check for suspicious decryption patterns
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
      format('User %s performed %s decryption operations in 1 hour', 
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
      'encryption_system_issues',
      'critical',
      'Multiple Encryption Failures Detected',
      format('System detected %s encryption failures in 24 hours', 
             failed_encryption_count),
      jsonb_build_object(
        'failure_count', failed_encryption_count,
        'time_window', '24_hours',
        'threat_level', 'critical',
        'requires_attention', true
      )
    );
  END IF;
END;
$function$;