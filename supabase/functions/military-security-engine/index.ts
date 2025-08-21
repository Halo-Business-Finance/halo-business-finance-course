import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, data } = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    let result;

    switch (action) {
      case 'register_device':
        result = await handleDeviceRegistration(supabaseAdmin, user.id, data, clientIP, userAgent);
        break;
      
      case 'validate_biometric':
        result = await handleBiometricValidation(supabaseAdmin, user.id, data);
        break;
      
      case 'check_geolocation':
        result = await handleGeolocationCheck(supabaseAdmin, user.id, data, clientIP);
        break;
      
      case 'analyze_behavior':
        result = await handleBehaviorAnalysis(supabaseAdmin, user.id, data, clientIP, userAgent);
        break;
      
      case 'threat_scan':
        result = await handleThreatScan(supabaseAdmin, data, clientIP, userAgent);
        break;
      
      case 'validate_mfa':
        result = await handleMFAValidation(supabaseAdmin, user.id, data);
        break;
      
      case 'emergency_lockdown':
        result = await handleEmergencyLockdown(supabaseAdmin, user.id, data);
        break;
      
      case 'get_security_status':
        result = await getSecurityStatus(supabaseAdmin, user.id);
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Military Security Engine error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleDeviceRegistration(supabase: any, userId: string, data: any, clientIP: string, userAgent: string) {
  const deviceFingerprint = generateDeviceFingerprint(data, userAgent);
  
  const deviceInfo = {
    device_name: data.deviceName,
    device_type: data.deviceType,
    browser_info: data.browserInfo,
    os_info: data.osInfo,
    hardware_info: data.hardwareInfo,
    screen_resolution: data.screenResolution,
    timezone: data.timezone,
    language: data.language,
    ip_address: clientIP,
    geolocation: data.geolocation
  };

  const { data: deviceId, error } = await supabase.rpc('register_device_fingerprint', {
    p_device_fingerprint: deviceFingerprint,
    p_device_info: deviceInfo
  });

  if (error) throw error;

  // Check if this is a new device
  const { data: existingDevices } = await supabase
    .from('user_devices')
    .select('id')
    .eq('user_id', userId)
    .eq('device_fingerprint', deviceFingerprint);

  const isNewDevice = !existingDevices || existingDevices.length === 0;

  return {
    deviceId,
    deviceFingerprint,
    isNewDevice,
    trustLevel: isNewDevice ? 0 : 50,
    requiresVerification: isNewDevice
  };
}

async function handleBiometricValidation(supabase: any, userId: string, data: any) {
  const { biometricType, biometricData, deviceId } = data;
  
  // In production, implement actual biometric validation
  const biometricHash = await hashBiometricData(biometricData);
  
  const { data: existingBiometric } = await supabase
    .from('user_biometrics')
    .select('*')
    .eq('user_id', userId)
    .eq('biometric_type', biometricType)
    .eq('is_active', true)
    .single();

  let isValid = false;
  
  if (existingBiometric) {
    // Validate against stored biometric
    isValid = existingBiometric.biometric_hash === biometricHash;
    
    await supabase
      .from('user_biometrics')
      .update({ 
        last_used_at: new Date().toISOString(),
        failure_count: isValid ? 0 : existingBiometric.failure_count + 1
      })
      .eq('id', existingBiometric.id);
  } else if (data.isEnrollment) {
    // Enroll new biometric
    const { data: newBiometric } = await supabase
      .from('user_biometrics')
      .insert({
        user_id: userId,
        biometric_type: biometricType,
        biometric_hash: biometricHash,
        device_id: deviceId,
        quality_score: data.qualityScore || 85
      })
      .select()
      .single();
    
    isValid = true;
  }

  await logSecurityEvent(supabase, {
    event_type: isValid ? 'biometric_validation_success' : 'biometric_validation_failed',
    severity: isValid ? 'low' : 'medium',
    details: {
      biometric_type: biometricType,
      device_id: deviceId,
      quality_score: data.qualityScore
    },
    user_id: userId
  });

  return {
    isValid,
    biometricType,
    requiresReEnrollment: !isValid && existingBiometric?.failure_count > 3
  };
}

async function handleGeolocationCheck(supabase: any, userId: string, data: any, clientIP: string) {
  const { latitude, longitude, countryCode } = data;
  
  const { data: result, error } = await supabase.rpc('validate_geolocation_access', {
    p_latitude: latitude,
    p_longitude: longitude,
    p_country_code: countryCode,
    p_ip_address: clientIP
  });

  if (error) throw error;

  return result;
}

async function handleBehaviorAnalysis(supabase: any, userId: string, data: any, clientIP: string, userAgent: string) {
  const behaviorData = {
    login_hour: new Date().getHours(),
    country: data.countryCode,
    device_fingerprint: generateDeviceFingerprint(data, userAgent),
    ip_address: clientIP,
    session_duration: data.sessionDuration,
    click_patterns: data.clickPatterns,
    keyboard_dynamics: data.keyboardDynamics,
    mouse_movements: data.mouseMovements
  };

  const { data: result, error } = await supabase.rpc('analyze_user_behavior_anomaly', {
    p_behavior_data: behaviorData
  });

  if (error) throw error;

  return result;
}

async function handleThreatScan(supabase: any, data: any, clientIP: string, userAgent: string) {
  const { data: result, error } = await supabase.rpc('check_threat_indicators', {
    p_ip_address: clientIP,
    p_user_agent: userAgent,
    p_additional_indicators: data.additionalIndicators || {}
  });

  if (error) throw error;

  // Additional threat intelligence checks
  if (result.threat_detected) {
    await logSecurityEvent(supabase, {
      event_type: 'threat_detected',
      severity: result.threat_level > 7 ? 'critical' : 'high',
      details: {
        ip_address: clientIP,
        user_agent: userAgent,
        threat_level: result.threat_level,
        threat_details: result.threat_details
      }
    });
  }

  return result;
}

async function handleMFAValidation(supabase: any, userId: string, data: any) {
  const { methodType, token, backupCode = false } = data;
  
  const { data: result, error } = await supabase.rpc('validate_mfa_token', {
    p_method_type: methodType,
    p_token: token,
    p_backup_code: backupCode
  });

  if (error) throw error;

  return { isValid: result };
}

async function handleEmergencyLockdown(supabase: any, adminUserId: string, data: any) {
  const { reason, affectedUsers, lockdownType } = data;
  
  const { data: result, error } = await supabase.rpc('emergency_security_lockdown', {
    p_reason: reason,
    p_affected_users: affectedUsers,
    p_lockdown_type: lockdownType
  });

  if (error) throw error;

  return result;
}

async function getSecurityStatus(supabase: any, userId: string) {
  // Get user's security configuration
  const [
    { data: devices },
    { data: mfaMethods },
    { data: biometrics },
    { data: recentEvents },
    { data: behaviorPatterns }
  ] = await Promise.all([
    supabase.from('user_devices').select('*').eq('user_id', userId).eq('is_active', true),
    supabase.from('user_mfa').select('*').eq('user_id', userId).eq('is_enabled', true),
    supabase.from('user_biometrics').select('*').eq('user_id', userId).eq('is_active', true),
    supabase.from('security_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
    supabase.from('user_behavior_patterns').select('*').eq('user_id', userId).limit(5)
  ]);

  const securityScore = calculateSecurityScore({
    deviceCount: devices?.length || 0,
    trustedDeviceCount: devices?.filter((d: any) => d.is_trusted)?.length || 0,
    mfaMethodCount: mfaMethods?.length || 0,
    biometricCount: biometrics?.length || 0,
    recentThreats: recentEvents?.filter((e: any) => e.severity === 'high' || e.severity === 'critical')?.length || 0
  });

  return {
    securityScore,
    devices: devices || [],
    mfaMethods: (mfaMethods || []).map((mfa: any) => ({ 
      ...mfa, 
      secret_key: undefined, 
      backup_codes: undefined 
    })),
    biometrics: (biometrics || []).map((bio: any) => ({ 
      ...bio, 
      biometric_hash: undefined, 
      template_data: undefined 
    })),
    recentEvents: recentEvents || [],
    behaviorPatterns: behaviorPatterns || [],
    riskLevel: securityScore > 80 ? 'low' : securityScore > 60 ? 'medium' : securityScore > 40 ? 'high' : 'critical'
  };
}

function generateDeviceFingerprint(deviceData: any, userAgent: string): string {
  const components = [
    deviceData.screenResolution,
    deviceData.timezone,
    deviceData.language,
    userAgent,
    deviceData.hardwareInfo?.cores,
    deviceData.hardwareInfo?.memory,
    deviceData.browserInfo?.version
  ].filter(Boolean);

  return btoa(components.join('|'));
}

async function hashBiometricData(biometricData: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(biometricData);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function calculateSecurityScore(factors: {
  deviceCount: number;
  trustedDeviceCount: number;
  mfaMethodCount: number;
  biometricCount: number;
  recentThreats: number;
}): number {
  let score = 50; // Base score

  // Device security
  score += Math.min(factors.trustedDeviceCount * 10, 20);
  
  // MFA
  score += Math.min(factors.mfaMethodCount * 15, 30);
  
  // Biometrics
  score += Math.min(factors.biometricCount * 10, 20);
  
  // Penalty for recent threats
  score -= factors.recentThreats * 5;
  
  return Math.max(0, Math.min(100, score));
}

async function logSecurityEvent(supabase: any, event: {
  event_type: string;
  severity: string;
  details: any;
  user_id?: string;
}) {
  await supabase.from('security_events').insert(event);
}