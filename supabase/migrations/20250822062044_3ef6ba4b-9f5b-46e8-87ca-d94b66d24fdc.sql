-- Fix function overloading conflicts and create missing encryption statistics function

-- Drop the duplicate assess_device_security_risk function that uses text for ip_address
DROP FUNCTION IF EXISTS public.assess_device_security_risk(text, jsonb);

-- Create the missing report_encryption_statistics function
CREATE OR REPLACE FUNCTION public.report_encryption_statistics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  stats jsonb;
  encrypted_profiles INTEGER;
  total_profiles INTEGER;
  encrypted_content INTEGER;
  encrypted_messages INTEGER;
BEGIN
  -- Count encrypted profiles
  SELECT COUNT(*) INTO encrypted_profiles
  FROM profiles 
  WHERE encryption_status = 'completed';
  
  -- Count total profiles
  SELECT COUNT(*) INTO total_profiles
  FROM profiles;
  
  -- Count encrypted course content
  SELECT COUNT(*) INTO encrypted_content
  FROM encrypted_course_content;
  
  -- Count encrypted messages
  SELECT COUNT(*) INTO encrypted_messages
  FROM encrypted_messages;
  
  -- Build statistics object
  stats := jsonb_build_object(
    'encrypted_profiles', encrypted_profiles,
    'total_profiles', total_profiles,
    'encrypted_content', encrypted_content,
    'encrypted_messages', encrypted_messages,
    'profile_encryption_percentage', 
      CASE 
        WHEN total_profiles > 0 THEN ROUND((encrypted_profiles::numeric / total_profiles::numeric) * 100, 2)
        ELSE 0 
      END,
    'timestamp', now()
  );
  
  -- Log the statistics request
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'encryption_statistics_reported',
    'low',
    stats || jsonb_build_object('requested_by', auth.uid())
  );
  
  RETURN stats;
END;
$function$;

-- Create get_security_metrics function if it doesn't exist
CREATE OR REPLACE FUNCTION public.get_security_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  metrics jsonb;
  total_events INTEGER;
  critical_events INTEGER;
  blocked_ips INTEGER;
  admin_count INTEGER;
BEGIN
  -- Count security events
  SELECT COUNT(*) INTO total_events
  FROM security_events
  WHERE created_at > now() - interval '24 hours';
  
  -- Count critical events
  SELECT COUNT(*) INTO critical_events
  FROM security_events
  WHERE severity = 'critical' 
    AND created_at > now() - interval '24 hours';
  
  -- Count blocked IPs (from rate limiting)
  SELECT COUNT(DISTINCT ip_address) INTO blocked_ips
  FROM rate_limit_attempts
  WHERE is_blocked = true;
  
  -- Count active admins
  SELECT COUNT(*) INTO admin_count
  FROM user_roles
  WHERE role IN ('admin', 'super_admin') 
    AND is_active = true;
  
  metrics := jsonb_build_object(
    'total_security_events_24h', total_events,
    'critical_events_24h', critical_events,
    'blocked_ips', blocked_ips,
    'active_admins', admin_count,
    'encryption_statistics', (SELECT report_encryption_statistics()),
    'timestamp', now()
  );
  
  RETURN metrics;
END;
$function$;