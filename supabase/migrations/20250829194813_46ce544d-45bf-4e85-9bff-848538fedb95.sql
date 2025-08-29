-- Phase 2: Update CMS Content Security and Restrict Public Access

-- Remove public access from CMS content blocks
UPDATE public.cms_content_blocks 
SET is_global = false
WHERE is_global = true;

-- Create security monitoring periodic tasks
CREATE OR REPLACE FUNCTION public.run_periodic_security_monitoring()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Run profile access pattern monitoring
  PERFORM monitor_profile_access_patterns();
  
  -- Run unusual access detection
  PERFORM detect_unusual_profile_access();
  
  -- Run comprehensive security analysis
  PERFORM run_comprehensive_security_analysis();
  
  -- Log monitoring execution
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'periodic_security_monitoring_completed',
    'low',
    jsonb_build_object(
      'timestamp', now(),
      'monitoring_functions', ARRAY[
        'monitor_profile_access_patterns',
        'detect_unusual_profile_access', 
        'run_comprehensive_security_analysis'
      ],
      'status', 'completed',
      'automated', true
    )
  );
END;
$$;