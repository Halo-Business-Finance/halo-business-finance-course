import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Fingerprint, 
  MapPin, 
  Smartphone, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Brain,
  Zap,
  CheckCircle,
  XCircle,
  Activity,
  Radar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityStatus {
  securityScore: number;
  devices: any[];
  mfaMethods: any[];
  biometrics: any[];
  recentEvents: any[];
  behaviorPatterns: any[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export const MilitarySecurityManager: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');
  const [biometricSupport, setBiometricSupport] = useState(false);
  const [geolocation, setGeolocation] = useState<GeolocationPosition | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeSecuritySuite();
    }
  }, [user]);

  const initializeSecuritySuite = async () => {
    try {
      setLoading(true);
      
      // Generate device fingerprint
      const fingerprint = await generateDeviceFingerprint();
      setDeviceFingerprint(fingerprint);
      
      // Check biometric support
      const hasBiometric = await checkBiometricSupport();
      setBiometricSupport(hasBiometric);
      
      // Get geolocation
      await getCurrentLocation();
      
      // Register device and get security status
      await registerCurrentDevice(fingerprint);
      await loadSecurityStatus();
      
    } catch (error) {
      console.error('Security initialization error:', error);
      toast({
        title: "Security Error",
        description: "Failed to initialize security suite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDeviceFingerprint = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Device fingerprint test', 10, 10);
    
    const fingerprint = {
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      canvasFingerprint: canvas.toDataURL(),
      hardwareInfo: {
        cores: navigator.hardwareConcurrency,
        memory: (navigator as any).deviceMemory,
        connection: (navigator as any).connection?.effectiveType
      },
      browserInfo: {
        userAgent: navigator.userAgent,
        vendor: navigator.vendor,
        webdriver: (navigator as any).webdriver
      }
    };

    return btoa(JSON.stringify(fingerprint));
  };

  const checkBiometricSupport = async (): Promise<boolean> => {
    if ('credentials' in navigator && 'create' in navigator.credentials) {
      try {
        // Check if WebAuthn is supported
        const available = await (window as any).PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable?.();
        return available || false;
      } catch {
        return false;
      }
    }
    return false;
  };

  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          });
        });
        setGeolocation(position);
      } catch (error) {
        console.warn('Geolocation not available:', error);
      }
    }
  };

  const registerCurrentDevice = async (fingerprint: string) => {
    try {
      const deviceInfo = {
        deviceName: `${navigator.platform} Device`,
        deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browserInfo: {
          userAgent: navigator.userAgent,
          vendor: navigator.vendor,
          language: navigator.language
        },
        osInfo: {
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled
        },
        hardwareInfo: {
          cores: navigator.hardwareConcurrency,
          memory: (navigator as any).deviceMemory,
          connection: (navigator as any).connection?.effectiveType
        },
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        geolocation: geolocation ? {
          latitude: geolocation.coords.latitude,
          longitude: geolocation.coords.longitude,
          accuracy: geolocation.coords.accuracy
        } : null
      };

      const { data, error } = await supabase.functions.invoke('military-security-engine', {
        body: {
          action: 'register_device',
          data: deviceInfo
        }
      });

      if (error) throw error;

      if (data?.data?.isNewDevice) {
        toast({
          title: "New Device Detected",
          description: "This device has been registered and requires verification.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Device registration error:', error);
    }
  };

  const loadSecurityStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('military-security-engine', {
        body: {
          action: 'get_security_status',
          data: {}
        }
      });

      if (error) throw error;
      setSecurityStatus(data.data);
    } catch (error) {
      console.error('Security status error:', error);
    }
  };

  const performBehaviorAnalysis = async () => {
    try {
      const behaviorData = {
        countryCode: 'US', // In production, get from IP geolocation
        sessionDuration: Date.now() - (performance.timing?.navigationStart || 0),
        clickPatterns: [], // Collect click patterns
        keyboardDynamics: [], // Collect typing patterns
        mouseMovements: [] // Collect mouse movement patterns
      };

      const { data, error } = await supabase.functions.invoke('military-security-engine', {
        body: {
          action: 'analyze_behavior',
          data: behaviorData
        }
      });

      if (error) throw error;

      const result = data.data;
      
      if (result.anomaly_score > 50) {
        toast({
          title: "Behavior Anomaly Detected",
          description: `Anomaly score: ${result.anomaly_score}. Additional verification may be required.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Behavior Analysis Complete",
          description: `Risk level: ${result.risk_level}. Behavior patterns are normal.`,
        });
      }
    } catch (error) {
      console.error('Behavior analysis error:', error);
    }
  };

  const performThreatScan = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('military-security-engine', {
        body: {
          action: 'threat_scan',
          data: {
            additionalIndicators: {
              browser_fingerprint: deviceFingerprint
            }
          }
        }
      });

      if (error) throw error;

      const result = data.data;
      
      if (result.threat_detected) {
        toast({
          title: "Security Threat Detected!",
          description: `Threat level: ${result.threat_level}. Access restrictions may apply.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Threat Scan Complete",
          description: "No security threats detected in current session.",
        });
      }
    } catch (error) {
      console.error('Threat scan error:', error);
    }
  };

  const checkGeolocationSecurity = async () => {
    if (!geolocation) {
      toast({
        title: "Geolocation Required",
        description: "Please enable location services for security verification.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('military-security-engine', {
        body: {
          action: 'check_geolocation',
          data: {
            latitude: geolocation.coords.latitude,
            longitude: geolocation.coords.longitude,
            countryCode: 'US' // In production, get from reverse geocoding
          }
        }
      });

      if (error) throw error;

      const result = data.data;
      
      if (!result.allowed) {
        toast({
          title: "Location Access Denied",
          description: "Your current location is not authorized for access.",
          variant: "destructive"
        });
      } else if (result.require_mfa) {
        toast({
          title: "Additional Verification Required",
          description: "Multi-factor authentication required for this location.",
          variant: "default"
        });
      } else {
        toast({
          title: "Location Verified",
          description: "Your location has been verified and access is granted.",
        });
      }
    } catch (error) {
      console.error('Geolocation check error:', error);
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRiskLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 animate-pulse" />
            Initializing Military-Grade Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Military-Grade Security Center
            </div>
            {securityStatus && (
              <Badge variant={getRiskLevelBadgeVariant(securityStatus.riskLevel)}>
                Risk: {securityStatus.riskLevel.toUpperCase()}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Advanced security monitoring and threat detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {securityStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getSecurityScoreColor(securityStatus.securityScore)}`}>
                  {securityStatus.securityScore}%
                </div>
                <div className="text-sm text-muted-foreground">Security Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {securityStatus.devices.length}
                </div>
                <div className="text-sm text-muted-foreground">Registered Devices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {securityStatus.mfaMethods.length}
                </div>
                <div className="text-sm text-muted-foreground">MFA Methods</div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button onClick={performBehaviorAnalysis} variant="outline" size="sm">
              <Brain className="h-4 w-4 mr-2" />
              Behavior Analysis
            </Button>
            <Button onClick={performThreatScan} variant="outline" size="sm">
              <Radar className="h-4 w-4 mr-2" />
              Threat Scan
            </Button>
            <Button onClick={checkGeolocationSecurity} variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Location Check
            </Button>
            <Button onClick={loadSecurityStatus} variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="biometrics" className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            Biometrics
          </TabsTrigger>
          <TabsTrigger value="mfa" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            MFA
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Management</CardTitle>
              <CardDescription>Registered and trusted devices</CardDescription>
            </CardHeader>
            <CardContent>
              {securityStatus?.devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg mb-2">
                  <div>
                    <div className="font-medium">{device.device_name || 'Unknown Device'}</div>
                    <div className="text-sm text-muted-foreground">
                      {device.device_type} • Trust Level: {device.trust_level}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last seen: {new Date(device.last_seen_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.is_trusted ? (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Trusted
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Untrusted
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="biometrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Biometric Authentication</CardTitle>
              <CardDescription>
                {biometricSupport 
                  ? "Biometric authentication is supported on this device" 
                  : "Biometric authentication is not supported on this device"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {biometricSupport ? (
                <div className="space-y-4">
                  {securityStatus?.biometrics.map((bio) => (
                    <div key={bio.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{bio.biometric_type}</div>
                        <div className="text-sm text-muted-foreground">
                          Quality: {bio.quality_score}% • 
                          Last used: {bio.last_used_at ? new Date(bio.last_used_at).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                      <Badge variant={bio.is_active ? "default" : "secondary"}>
                        {bio.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                  
                  <Alert>
                    <Fingerprint className="h-4 w-4" />
                    <AlertDescription>
                      Biometric authentication provides an additional layer of security using your unique biological characteristics.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Biometric authentication is not available on this device. Consider using a device with fingerprint, face, or other biometric sensors for enhanced security.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mfa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>Additional security layers for account protection</CardDescription>
            </CardHeader>
            <CardContent>
              {securityStatus?.mfaMethods.map((mfa) => (
                <div key={mfa.id} className="flex items-center justify-between p-4 border rounded-lg mb-2">
                  <div>
                    <div className="font-medium capitalize">{mfa.method_type.replace('_', ' ')}</div>
                    <div className="text-sm text-muted-foreground">
                      {mfa.method_name || 'Default'} • 
                      Last used: {mfa.last_used_at ? new Date(mfa.last_used_at).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={mfa.is_enabled ? "default" : "secondary"}>
                      {mfa.is_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    {mfa.is_primary && (
                      <Badge variant="outline">Primary</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Monitoring</CardTitle>
              <CardDescription>Real-time security events and behavior analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityStatus?.recentEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{event.event_type.replace(/_/g, ' ').toUpperCase()}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant={event.severity === 'critical' ? 'destructive' : event.severity === 'high' ? 'destructive' : 'default'}>
                      {event.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};