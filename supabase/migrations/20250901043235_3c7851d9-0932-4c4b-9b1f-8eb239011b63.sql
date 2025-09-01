-- Update the security monitoring to focus on volume-based alerts rather than time-based alerts
-- for a 24/7 educational platform

-- Create a function to detect volume-based anomalies instead of time-based ones
CREATE OR REPLACE FUNCTION detect_volume_based_profile_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  anomaly_record RECORD;
  normal_hourly_avg INTEGER;
  current_hour_count INTEGER;
BEGIN
  -- Calculate normal hourly average for each admin over the past 7 days
  FOR anomaly_record IN
    SELECT 
      admin_user_id,
      COUNT(*) as last_hour_access,
      -- Calculate 7-day hourly average for this admin
      (
        SELECT COALESCE(AVG(hourly_count), 0)
        FROM (
          SELECT COUNT(*) as hourly_count
          FROM admin_audit_log past
          WHERE past.admin_user_id = recent.admin_user_id
            AND past.action = 'customer_pii_access_granted'
            AND past.created_at > now() - interval '7 days'
            AND past.created_at <= now() - interval '1 hour' -- Exclude current hour
          GROUP BY DATE_TRUNC('hour', past.created_at)
        ) hourly_stats
      ) as seven_day_hourly_avg
    FROM admin_audit_log recent
    WHERE recent.action = 'customer_pii_access_granted'
      AND recent.created_at > now() - interval '1 hour'
    GROUP BY admin_user_id
    HAVING COUNT(*) > 50 -- Only alert if significant volume
  LOOP
    -- Alert if current hour is significantly above normal patterns
    IF anomaly_record.last_hour_access > (anomaly_record.seven_day_hourly_avg * 3 + 20) THEN
      PERFORM create_security_alert(
        'unusual_volume_customer_access',
        'high',
        'Unusual Volume of Customer Data Access',
        format('Admin %s accessed customer data %s times in the last hour, which is %sx their normal hourly average of %s. This may indicate data scraping or unusual administrative activity.',
               anomaly_record.admin_user_id, 
               anomaly_record.last_hour_access,
               ROUND(anomaly_record.last_hour_access / GREATEST(anomaly_record.seven_day_hourly_avg, 1), 1),
               ROUND(anomaly_record.seven_day_hourly_avg, 1)),
        jsonb_build_object(
          'admin_user_id', anomaly_record.admin_user_id,
          'current_hour_access', anomaly_record.last_hour_access,
          'normal_hourly_average', ROUND(anomaly_record.seven_day_hourly_avg, 1),
          'multiplier_above_normal', ROUND(anomaly_record.last_hour_access / GREATEST(anomaly_record.seven_day_hourly_avg, 1), 1),
          'alert_type', 'volume_based_anomaly',
          'requires_investigation', true,
          'suitable_for_24_7_operation', true
        )
      );
    END IF;
  END LOOP;

  -- Also check for rapid-fire access patterns (potential automated scraping)
  FOR anomaly_record IN
    SELECT 
      admin_user_id,
      COUNT(*) as rapid_access_count,
      MIN(created_at) as first_access,
      MAX(created_at) as last_access
    FROM admin_audit_log
    WHERE action = 'customer_pii_access_granted'
      AND created_at > now() - interval '10 minutes'
    GROUP BY admin_user_id
    HAVING COUNT(*) >= 30 -- 30+ accesses in 10 minutes = potential automation
  LOOP
    PERFORM create_security_alert(
      'rapid_fire_customer_access',
      'critical',
      'Rapid-Fire Customer Data Access Detected',
      format('CRITICAL: Admin %s accessed customer data %s times in 10 minutes (from %s to %s). This rapid pattern suggests potential automated data scraping or security breach.',
             anomaly_record.admin_user_id,
             anomaly_record.rapid_access_count,
             anomaly_record.first_access,
             anomaly_record.last_access),
      jsonb_build_object(
        'admin_user_id', anomaly_record.admin_user_id,
        'access_count_10_minutes', anomaly_record.rapid_access_count,
        'first_access', anomaly_record.first_access,
        'last_access', anomaly_record.last_access,
        'duration_minutes', EXTRACT(EPOCH FROM (anomaly_record.last_access - anomaly_record.first_access))/60,
        'potential_automation', true,
        'immediate_investigation_required', true
      )
    );
  END LOOP;
END;
$function$;

-- Update the periodic security monitoring to use volume-based detection
CREATE OR REPLACE FUNCTION run_24_7_security_monitoring()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Run volume-based anomaly detection instead of time-based
  PERFORM detect_volume_based_profile_access();
  
  -- Run existing security analysis
  PERFORM analyze_security_events();
  
  -- Log monitoring execution
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    '24_7_security_monitoring_completed',
    'low',
    jsonb_build_object(
      'timestamp', now(),
      'monitoring_type', 'volume_based_anomaly_detection',
      'suitable_for', '24_7_educational_platform',
      'analysis_modules', ARRAY[
        'volume_based_profile_access_detection',
        'rapid_fire_access_detection', 
        'security_events_analysis'
      ],
      'status', 'completed'
    )
  );
END;
$function$;

-- Create a function to clean up old time-based alerts that are no longer relevant
CREATE OR REPLACE FUNCTION cleanup_time_based_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Mark old time-based alerts as resolved since we're moving to volume-based
  UPDATE security_alerts 
  SET 
    status = 'resolved',
    resolved_at = now(),
    resolution_notes = 'Resolved: Switched to volume-based monitoring for 24/7 operation'
  WHERE alert_type = 'off_hours_customer_access'
    AND status = 'open'
    AND created_at < now() - interval '1 hour';
    
  -- Log the cleanup
  INSERT INTO public.security_events (event_type, severity, details)
  VALUES (
    'time_based_alerts_cleanup',
    'low',
    jsonb_build_object(
      'timestamp', now(),
      'action', 'resolved_outdated_time_based_alerts',
      'reason', 'switched_to_volume_based_monitoring_for_24_7_operation',
      'alerts_resolved', (SELECT COUNT(*) FROM security_alerts WHERE alert_type = 'off_hours_customer_access' AND status = 'resolved' AND resolved_at > now() - interval '1 minute')
    )
  );
END;
$function$;