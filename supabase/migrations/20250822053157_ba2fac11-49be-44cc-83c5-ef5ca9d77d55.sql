-- Fix search path security warning for get_profile_encryption_stats function
CREATE OR REPLACE FUNCTION get_profile_encryption_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    result json;
    total_count integer := 0;
    encrypted_count integer := 0;
BEGIN
    -- Only allow super_admin access
    IF NOT check_user_has_role('super_admin') THEN
        RAISE EXCEPTION 'Access denied. Super admin privileges required.';
    END IF;

    -- Get total profile count (masked for security)
    SELECT COUNT(*) INTO total_count FROM profiles;
    
    -- Get encrypted profile count (only summary stats, no individual data)
    SELECT COUNT(*) INTO encrypted_count 
    FROM profiles 
    WHERE encryption_status = 'encrypted';
    
    -- Log this statistics access
    INSERT INTO security_events (
        event_type,
        severity,
        description,
        details,
        user_id
    ) VALUES (
        'profile_stats_accessed',
        'low',
        'Profile encryption statistics accessed',
        json_build_object(
            'total_profiles', total_count,
            'encrypted_profiles', encrypted_count,
            'access_type', 'statistics_only'
        ),
        auth.uid()
    );
    
    -- Return aggregated statistics only
    result := json_build_object(
        'total_count', total_count,
        'encrypted_count', encrypted_count,
        'encryption_percentage', CASE 
            WHEN total_count > 0 THEN ROUND((encrypted_count::decimal / total_count::decimal) * 100, 2)
            ELSE 0
        END
    );
    
    RETURN result;
END;
$$;