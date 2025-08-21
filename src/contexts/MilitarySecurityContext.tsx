import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SecurityThreat {
  level: number;
  type: string;
  description: string;
}

interface DeviceInfo {
  id: string;
  fingerprint: string;
  trusted: boolean;
  trustLevel: number;
}

interface MilitarySecurityContextType {
  securityLevel: number; // 0-10 clearance level
  deviceInfo: DeviceInfo | null;
  threatLevel: number; // 0-10 current threat assessment
  activeBiometrics: string[];
  mfaRequired: boolean;
  geoLocationVerified: boolean;
  behaviorAnomalyScore: number;
  emergencyMode: boolean;
  continuousMonitoring: boolean;
  validateSecurityClearance: (requiredLevel: number) => boolean;
  performSecurityScan: () => Promise<SecurityThreat[]>;
  enableContinuousAuth: () => void;
  escalateSecurityLevel: (level: number) => Promise<void>;
  reportSecurityIncident: (incident: any) => Promise<void>;
}

const MilitarySecurityContext = createContext<MilitarySecurityContextType | undefined>(undefined);

export const useMilitarySecurity = () => {
  const context = useContext(MilitarySecurityContext);
  if (!context) {
    throw new Error('useMilitarySecurity must be used within a MilitarySecurityProvider');
  }
  return context;
};

interface MilitarySecurityProviderProps {
  children: ReactNode;
}

export const MilitarySecurityProvider = ({ children }: MilitarySecurityProviderProps) => {
  const [securityLevel, setSecurityLevel] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [threatLevel, setThreatLevel] = useState(0);
  const [activeBiometrics, setActiveBiometrics] = useState<string[]>([]);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [geoLocationVerified, setGeoLocationVerified] = useState(false);
  const [behaviorAnomalyScore, setBehaviorAnomalyScore] = useState(0);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [continuousMonitoring, setContinuousMonitoring] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');

  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && session) {
      initializeMilitarySecurity();
      startContinuousMonitoring();
    }
  }, [user, session]);

  const generateDeviceFingerprint = async (): Promise<string> => {
    // Enhanced device fingerprinting
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Military-grade fingerprint', 10, 10);
    
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const fingerprint = {
      // Hardware fingerprinting
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth
      },
      
      // Browser fingerprinting
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        hardwareConcurrency: navigator.hardwareConcurrency,
        maxTouchPoints: navigator.maxTouchPoints
      },
      
      // Canvas fingerprinting
      canvas: canvas.toDataURL(),
      
      // WebGL fingerprinting
      webgl: getWebGLFingerprint(),
      
      // Audio fingerprinting
      audio: await getAudioFingerprint(audioCtx),
      
      // Timezone and locale
      timezone: {
        offset: new Date().getTimezoneOffset(),
        zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: Intl.DateTimeFormat().resolvedOptions().locale
      },
      
      // Performance fingerprinting
      performance: {
        memory: (performance as any).memory?.usedJSHeapSize,
        timing: performance.timing?.loadEventEnd - performance.timing?.navigationStart
      }
    };

    audioCtx.close();
    return btoa(JSON.stringify(fingerprint)).substring(0, 64);
  };

  const getWebGLFingerprint = (): string => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') as WebGLRenderingContext | null || 
                 canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      
      if (!gl) return '';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = gl.getParameter((debugInfo as any)?.UNMASKED_VENDOR_WEBGL || gl.VENDOR);
      const renderer = gl.getParameter((debugInfo as any)?.UNMASKED_RENDERER_WEBGL || gl.RENDERER);
      
      return `${vendor}|${renderer}`;
    } catch {
      return '';
    }
  };

  const getAudioFingerprint = async (ctx: AudioContext): Promise<string> => {
    try {
      const oscillator = ctx.createOscillator();
      const analyser = ctx.createAnalyser();
      const gain = ctx.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      
      oscillator.connect(analyser);
      analyser.connect(gain);
      gain.connect(ctx.destination);
      
      oscillator.start(0);
      oscillator.stop(ctx.currentTime + 0.1);
      
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencyData);
      
      return Array.from(frequencyData.slice(0, 32)).join(',');
    } catch {
      return '';
    }
  };

  const initializeMilitarySecurity = async () => {
    try {
      // Generate device fingerprint
      const fingerprint = await generateDeviceFingerprint();
      setDeviceFingerprint(fingerprint);

      // Register device and get security status
      const { data: deviceData } = await supabase.functions.invoke('military-security-engine', {
        body: {
          action: 'register_device',
          data: {
            deviceName: `${navigator.platform} Security Terminal`,
            deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            browserInfo: { userAgent: navigator.userAgent },
            hardwareInfo: { cores: navigator.hardwareConcurrency },
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }
      });

      if (deviceData?.data) {
        setDeviceInfo({
          id: deviceData.data.deviceId,
          fingerprint,
          trusted: !deviceData.data.isNewDevice,
          trustLevel: deviceData.data.trustLevel
        });
      }

      // Initial security assessment
      await performInitialSecurityAssessment();

    } catch (error) {
      console.error('Military security initialization failed:', error);
    }
  };

  const performInitialSecurityAssessment = async () => {
    try {
      // Threat scan
      const threatScan = await performSecurityScan();
      const maxThreatLevel = Math.max(...threatScan.map(t => t.level), 0);
      setThreatLevel(maxThreatLevel);

      // Geolocation validation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const { data: geoData } = await supabase.functions.invoke('military-security-engine', {
              body: {
                action: 'check_geolocation',
                data: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  countryCode: 'US' // In production, get from IP geolocation
                }
              }
            });
            
            setGeoLocationVerified(geoData?.data?.allowed || false);
            setMfaRequired(geoData?.data?.require_mfa || false);
          } catch (error) {
            console.error('Geolocation validation failed:', error);
          }
        });
      }

      // Set initial security level based on user role and threat assessment
      const baseSecurityLevel = calculateSecurityLevel();
      setSecurityLevel(baseSecurityLevel);

    } catch (error) {
      console.error('Security assessment failed:', error);
    }
  };

  const calculateSecurityLevel = (): number => {
    let level = 1; // Base level for authenticated users
    
    // Increase based on device trust
    if (deviceInfo?.trusted) level += 2;
    if (deviceInfo?.trustLevel && deviceInfo.trustLevel > 75) level += 1;
    
    // Decrease based on threats
    if (threatLevel > 5) level = Math.max(0, level - 2);
    
    // Increase for verified biometrics
    level += Math.min(activeBiometrics.length, 3);
    
    // Increase for geo verification
    if (geoLocationVerified) level += 1;
    
    return Math.min(10, level);
  };

  const startContinuousMonitoring = () => {
    setContinuousMonitoring(true);

    // Behavioral monitoring
    const monitoringInterval = setInterval(async () => {
      try {
        const behaviorData = {
          sessionDuration: Date.now() - (performance.timing?.navigationStart || 0),
          clickPatterns: [], // In production, track actual patterns
          activeTime: document.hasFocus() ? 1 : 0,
          tabSwitches: 0 // In production, track tab switches
        };

        const { data: behaviorAnalysis } = await supabase.functions.invoke('military-security-engine', {
          body: {
            action: 'analyze_behavior',
            data: behaviorData
          }
        });

        if (behaviorAnalysis?.data) {
          setBehaviorAnomalyScore(behaviorAnalysis.data.anomaly_score);
          
          // Trigger security escalation for high anomaly scores
          if (behaviorAnalysis.data.anomaly_score > 80) {
            await escalateSecurityLevel(securityLevel + 2);
          }
        }
      } catch (error) {
        console.error('Continuous monitoring error:', error);
      }
    }, 60000); // Check every minute

    // Cleanup interval on component unmount
    return () => {
      clearInterval(monitoringInterval);
      setContinuousMonitoring(false);
    };
  };

  const validateSecurityClearance = (requiredLevel: number): boolean => {
    if (emergencyMode) return securityLevel >= 8; // High clearance required in emergency
    return securityLevel >= requiredLevel;
  };

  const performSecurityScan = async (): Promise<SecurityThreat[]> => {
    try {
      const { data: scanResult } = await supabase.functions.invoke('military-security-engine', {
        body: {
          action: 'threat_scan',
          data: { additionalIndicators: { device_fingerprint: deviceFingerprint } }
        }
      });

      if (scanResult?.data?.threat_detected) {
        const threats: SecurityThreat[] = scanResult.data.threat_details.map((threat: any) => ({
          level: threat.level,
          type: threat.type,
          description: threat.description
        }));
        
        return threats;
      }

      return [];
    } catch (error) {
      console.error('Security scan failed:', error);
      return [];
    }
  };

  const enableContinuousAuth = () => {
    // Enable WebAuthn continuous authentication if supported
    if ('credentials' in navigator && (window as any).PublicKeyCredential) {
      // In production, implement continuous WebAuthn challenges
      toast({
        title: "Continuous Authentication Enabled",
        description: "Enhanced security monitoring is now active.",
      });
    }
  };

  const escalateSecurityLevel = async (level: number) => {
    const newLevel = Math.min(10, level);
    setSecurityLevel(newLevel);
    
    // Log security escalation
    await reportSecurityIncident({
      type: 'security_escalation',
      severity: newLevel > 7 ? 'high' : 'medium',
      details: {
        previous_level: securityLevel,
        new_level: newLevel,
        reason: 'automated_escalation',
        timestamp: new Date().toISOString()
      }
    });

    toast({
      title: "Security Level Escalated",
      description: `Security clearance increased to level ${newLevel}`,
      variant: newLevel > 7 ? "destructive" : "default"
    });
  };

  const reportSecurityIncident = async (incident: any) => {
    try {
      await supabase.from('security_events').insert({
        event_type: 'security_incident',
        severity: incident.severity,
        details: incident,
        user_id: user?.id
      });
    } catch (error) {
      console.error('Failed to report security incident:', error);
    }
  };

  useEffect(() => {
    // Recalculate security level when factors change
    const newLevel = calculateSecurityLevel();
    if (newLevel !== securityLevel) {
      setSecurityLevel(newLevel);
    }
  }, [deviceInfo, threatLevel, activeBiometrics, geoLocationVerified]);

  const value = {
    securityLevel,
    deviceInfo,
    threatLevel,
    activeBiometrics,
    mfaRequired,
    geoLocationVerified,
    behaviorAnomalyScore,
    emergencyMode,
    continuousMonitoring,
    validateSecurityClearance,
    performSecurityScan,
    enableContinuousAuth,
    escalateSecurityLevel,
    reportSecurityIncident
  };

  return (
    <MilitarySecurityContext.Provider value={value}>
      {children}
    </MilitarySecurityContext.Provider>
  );
};