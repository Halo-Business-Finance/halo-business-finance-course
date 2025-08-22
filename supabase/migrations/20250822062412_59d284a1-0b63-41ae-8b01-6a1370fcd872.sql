-- Create secure RPC function to get encrypted messages for authenticated users

CREATE OR REPLACE FUNCTION public.get_user_encrypted_messages()
RETURNS TABLE(
  id uuid,
  sender_id uuid,
  recipient_id uuid,
  encrypted_subject text,
  encrypted_body text,
  message_hash text,
  is_read boolean,
  expires_at timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Return messages where user is sender or recipient
  RETURN QUERY
  SELECT 
    em.id,
    em.sender_id,
    em.recipient_id,
    em.encrypted_subject,
    em.encrypted_body,
    em.message_hash,
    em.is_read,
    em.expires_at,
    em.created_at
  FROM public.encrypted_messages em
  WHERE em.sender_id = auth.uid() 
     OR em.recipient_id = auth.uid()
  ORDER BY em.created_at DESC;
END;
$function$;