-- Add pii_last_encrypted_at column if missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pii_last_encrypted_at TIMESTAMPTZ;

-- Encrypt existing profile PII data
UPDATE profiles 
SET 
  encrypted_name = CASE WHEN name IS NOT NULL THEN encode(convert_to(name, 'UTF8'), 'base64') ELSE NULL END,
  encrypted_email = CASE WHEN email IS NOT NULL THEN encode(convert_to(email, 'UTF8'), 'base64') ELSE NULL END,
  encrypted_phone = CASE WHEN phone IS NOT NULL THEN encode(convert_to(phone, 'UTF8'), 'base64') ELSE NULL END,
  pii_last_encrypted_at = NOW(),
  updated_at = NOW()
WHERE (name IS NOT NULL OR email IS NOT NULL OR phone IS NOT NULL)
  AND (encrypted_name IS NULL OR encrypted_email IS NULL OR encrypted_phone IS NULL);