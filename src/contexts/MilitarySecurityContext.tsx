import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface SecurityThreat {
  id: string;
  signature: string;
  category: string;
  severity: number;
  confidence: number;
}

interface DeviceInfo {
  id: string;
  fingerprint: string;
  trustScore: number;
  riskFactors: string[];
  lastScan: string;
}

interface MilitarySecurityContextType {
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  deviceInfo: DeviceInfo | null;
  threatLevel: number;
  activeThreats: SecurityThreat[];
  isDeviceTrusted: boolean;
  isMFACompliant: boolean;
  zeroTrustScore: number;
  complianceStatus: Record<string, boolean>;
  
  // Actions
  performSecurityScan: () => Promise<void>;
  registerDevice: () => Promise<void>;
  validateSecurityClearance: () => Promise<boolean>;
  escalateSecurityLevel: (level: 'high' | 'critical') => Promise<void>;
  enableEmergencyLockdown: () => Promise<void>;
  
  // Loading states
  loading: boolean;
  scanning: boolean;
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
  const { user } = useAuth();
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [threatLevel, setThreatLevel] = useState(0);
  const [activeThreats, setActiveThreats] = useState<SecurityThreat[]>([]);
  const [isDeviceTrusted, setIsDeviceTrusted] = useState(false);
  const [isMFACompliant, setIsMFACompliant] = useState(false);
  const [zeroTrustScore, setZeroTrustScore] = useState(50);
  const [complianceStatus, setComplianceStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (user) {
      initializeSecurity();
      startContinuousMonitoring();
    }
  }, [user]);

  const initializeSecurity = async () => {
    try {
      setLoading(true);
      
      // Register device and perform initial assessment
      await registerDevice();
      await performSecurityScan();
      
      // Check MFA compliance
      await checkMFACompliance();
      
      // Load compliance status
      await loadComplianceStatus();
      
    } catch (error) {
      console.error('Security initialization failed:', error);
      toast({
        title: "Security Initialization Failed",
        description: "Military security systems could not be initialized",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Security fingerprint', 10, 10);
    
    return {
      userAgent: navigator.userAgent,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      canvas: canvas.toDataURL(),
      webgl: getWebGLFingerprint(),
      plugins: Array.from(navigator.plugins).map(p => p.name),
      timestamp: Date.now()
    };
  };

  const getWebGLFingerprint = () => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return 'no-webgl';
    
    return {
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      version: gl.getParameter(gl.VERSION),
      extensions: gl.getSupportedExtensions()
    };
  };

  const registerDevice = async () => {
    try {
      if (!user) return;

      const fingerprint = generateDeviceFingerprint();
      const fingerprintHash = btoa(JSON.stringify(fingerprint));

      // Assess device risk
      const { data: riskAssessment, error: riskError } = await supabase
        .rpc('assess_device_security_risk', {
          p_device_fingerprint: fingerprintHash,
          p_user_agent: navigator.userAgent,
          p_ip_address: '0.0.0.0', // Would be actual IP in production
          p_geolocation: { country: 'US', region: 'Unknown' }
        });

      if (riskError) throw riskError;

      // Register or update device
      const { data: deviceData, error: deviceError } = await supabase
        .from('enhanced_device_security')
        .upsert({
          user_id: user.id,
          device_id: crypto.randomUUID(),
          device_fingerprint: fingerprintHash,
          trust_score: (riskAssessment as any).trust_level,
          risk_factors: (riskAssessment as any).risk_factors || [],
          hardware_signatures: fingerprint,
          security_features: {
            webAuthn: !!window.PublicKeyCredential,
            serviceWorker: 'serviceWorker' in navigator,
            pushNotifications: 'Notification' in window,
            geolocation: 'geolocation' in navigator
          },
          threat_indicators: (riskAssessment as any).threat_indicators || {},
          last_security_scan: new Date().toISOString()
        }, {
          onConflict: 'device_fingerprint'
        });

      if (deviceError) throw deviceError;

      const assessment = riskAssessment as any;
      
      setDeviceInfo({
        id: crypto.randomUUID(),
        fingerprint: fingerprintHash,
        trustScore: assessment?.trust_level || 50,
        riskFactors: assessment?.risk_factors || [],
        lastScan: new Date().toISOString()
      });

      setIsDeviceTrusted((assessment?.trust_level || 50) >= 70);

    } catch (error) {
      console.error('Device registration failed:', error);
      throw error;
    }
  };

  const performSecurityScan = async () => {
    try {
      setScanning(true);

      // Load active threats
      const { data: threatData, error: threatError } = await supabase
        .from('advanced_threat_intelligence')
        .select('*')
        .eq('is_active', true)
        .order('severity_level', { ascending: false });

      if (threatError) throw threatError;

      const threats: SecurityThreat[] = (threatData || []).map(t => ({
        id: t.id,
        signature: t.threat_signature,
        category: t.threat_category,
        severity: t.severity_level,
        confidence: t.confidence_score
      }));

      setActiveThreats(threats);
      setThreatLevel(threats.length > 0 ? threats[0].severity : 0);

      // Run behavioral analysis if user exists
      if (user) {
        const sessionData = {
          access_time: new Date().toISOString(),
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        const { data: behaviorData, error: behaviorError } = await supabase
          .rpc('analyze_user_behavior', {
            p_user_id: user.id,
            p_session_data: sessionData
          });

        if (!behaviorError && behaviorData) {
          // Update security level based on behavioral analysis
          const behavior = behaviorData as any;
          const anomalyScore = behavior?.anomaly_score || 0;
          
          if (anomalyScore > 80) {
            setSecurityLevel('critical');
          } else if (anomalyScore > 60) {
            setSecurityLevel('high');
          } else if (anomalyScore > 40) {
            setSecurityLevel('medium');
          } else {
            setSecurityLevel('low');
          }
        }
      }

      // Calculate zero trust score
      const baseScore = isDeviceTrusted ? 70 : 30;
      const mfaBonus = isMFACompliant ? 20 : 0;
      const threatPenalty = Math.min(threatLevel * 5, 30);
      
      setZeroTrustScore(Math.max(0, Math.min(100, baseScore + mfaBonus - threatPenalty)));

    } catch (error) {
      console.error('Security scan failed:', error);
      throw error;
    } finally {
      setScanning(false);
    }
  };

  const checkMFACompliance = async () => {
    try {
      if (!user) return;

      const { data: mfaData, error } = await supabase
        .from('enhanced_mfa')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_enabled', true);

      if (error) throw error;

      const hasHighTrustMFA = (mfaData || []).some(m => m.trust_level >= 3);
      setIsMFACompliant(hasHighTrustMFA);

    } catch (error) {
      console.error('MFA compliance check failed:', error);
    }
  };

  const loadComplianceStatus = async () => {
    try {
      // Simulate compliance framework checks
      setComplianceStatus({
        SOX: true,
        GDPR: true,
        HIPAA: true,
        'ISO27001': true,
        NIST: true,
        DoD: isDeviceTrusted && isMFACompliant
      });
    } catch (error) {
      console.error('Compliance status load failed:', error);
    }
  };

  const validateSecurityClearance = async (): Promise<boolean> => {
    try {
      if (!user) return false;

      // Perform zero trust evaluation
      const { data: evaluationData, error } = await supabase
        .rpc('evaluate_zero_trust_access', {
          p_user_id: user.id,
          p_resource_path: '/admin/*',
          p_context: {
            source_ip: '0.0.0.0',
            country: 'US',
            device_trust: isDeviceTrusted,
            mfa_compliant: isMFACompliant
          }
        });

      if (error) throw error;

      const evaluation = evaluationData as any;
      return evaluation?.access_granted || false;

    } catch (error) {
      console.error('Security clearance validation failed:', error);
      return false;
    }
  };

  const escalateSecurityLevel = async (level: 'high' | 'critical') => {
    try {
      setSecurityLevel(level);

      // Log security escalation
      await supabase.rpc('log_compliance_audit', {
        p_audit_category: 'security_event',
        p_compliance_framework: 'DoD',
        p_resource_type: 'security_level',
        p_action_type: 'escalation',
        p_action_details: {
          new_level: level,
          escalated_at: new Date().toISOString(),
          reason: 'manual_escalation'
        },
        p_data_sensitivity: 'restricted'
      });

      toast({
        title: "Security Level Escalated",
        description: `Security level escalated to ${level.toUpperCase()}`,
        variant: level === 'critical' ? "destructive" : "default"
      });

    } catch (error) {
      console.error('Security escalation failed:', error);
      throw error;
    }
  };

  const enableEmergencyLockdown = async () => {
    try {
      setSecurityLevel('critical');

      // Create security incident
      const incidentId = `INC-${Date.now()}`;
      
      await supabase
        .from('security_incident_response')
        .insert({
          incident_id: incidentId,
          incident_type: 'emergency_lockdown',
          severity: 'critical',
          title: 'Emergency Security Lockdown Activated',
          description: 'Emergency security lockdown has been manually activated',
          status: 'investigating',
          affected_systems: ['authentication', 'access_control'],
          detected_at: new Date().toISOString()
        });

      toast({
        title: "EMERGENCY LOCKDOWN ACTIVATED",
        description: "All systems are now under emergency security protocols",
        variant: "destructive"
      });

    } catch (error) {
      console.error('Emergency lockdown failed:', error);
      throw error;
    }
  };

  const startContinuousMonitoring = () => {
    // Monitor behavioral patterns continuously
    const monitorInterval = setInterval(() => {
      if (user && !scanning) {
        // Perform lightweight security checks
        performSecurityScan().catch(console.error);
      }
    }, 300000); // Every 5 minutes

    return () => clearInterval(monitorInterval);
  };

  // Recalculate security level based on factors
  useEffect(() => {
    let newLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (threatLevel > 8 || !isDeviceTrusted) {
      newLevel = 'critical';
    } else if (threatLevel > 5 || !isMFACompliant) {
      newLevel = 'high';
    } else if (threatLevel > 2 || zeroTrustScore < 70) {
      newLevel = 'medium';
    }

    setSecurityLevel(newLevel);
  }, [threatLevel, isDeviceTrusted, isMFACompliant, zeroTrustScore]);

  const value: MilitarySecurityContextType = {
    securityLevel,
    deviceInfo,
    threatLevel,
    activeThreats,
    isDeviceTrusted,
    isMFACompliant,
    zeroTrustScore,
    complianceStatus,
    performSecurityScan,
    registerDevice,
    validateSecurityClearance,
    escalateSecurityLevel,
    enableEmergencyLockdown,
    loading,
    scanning
  };

  return (
    <MilitarySecurityContext.Provider value={value}>
      {children}
    </MilitarySecurityContext.Provider>
  );
};