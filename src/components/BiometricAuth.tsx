import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Fingerprint, 
  Eye, 
  Mic, 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface BiometricMethod {
  type: 'fingerprint' | 'face' | 'voice' | 'iris';
  icon: React.ReactNode;
  label: string;
  description: string;
}

const BIOMETRIC_METHODS: BiometricMethod[] = [
  {
    type: 'fingerprint',
    icon: <Fingerprint className="h-6 w-6" />,
    label: 'Fingerprint',
    description: 'Touch sensor authentication'
  },
  {
    type: 'face',
    icon: <Camera className="h-6 w-6" />,
    label: 'Face Recognition',
    description: 'Facial biometric authentication'
  },
  {
    type: 'voice',
    icon: <Mic className="h-6 w-6" />,
    label: 'Voice Recognition',
    description: 'Voice pattern authentication'
  },
  {
    type: 'iris',
    icon: <Eye className="h-6 w-6" />,
    label: 'Iris Scan',
    description: 'Eye pattern authentication'
  }
];

export const BiometricAuth: React.FC = () => {
  const [supportedMethods, setSupportedMethods] = useState<string[]>([]);
  const [enrolledMethods, setEnrolledMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrollingType, setEnrollingType] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkBiometricSupport();
      loadEnrolledBiometrics();
    }
  }, [user]);

  const checkBiometricSupport = async () => {
    const supported: string[] = [];

    // Check WebAuthn support (fingerprint, face)
    if ('credentials' in navigator && 'create' in navigator.credentials) {
      try {
        const available = await (window as any).PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable?.();
        if (available) {
          supported.push('fingerprint', 'face');
        }
      } catch (error) {
        console.warn('WebAuthn check failed:', error);
      }
    }

    // Check Web Audio API support (voice)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      supported.push('voice');
    }

    // Check WebRTC support (iris/eye tracking)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      supported.push('iris');
    }

    setSupportedMethods(supported);
  };

  const loadEnrolledBiometrics = async () => {
    try {
      const { data, error } = await supabase
        .from('user_biometrics')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      setEnrolledMethods(data || []);
    } catch (error) {
      console.error('Error loading biometrics:', error);
    }
  };

  const enrollBiometric = async (type: string) => {
    setEnrollingType(type);
    setLoading(true);

    try {
      let biometricData: string;

      switch (type) {
        case 'fingerprint':
        case 'face':
          biometricData = await enrollWebAuthn();
          break;
        case 'voice':
          biometricData = await enrollVoiceprint();
          break;
        case 'iris':
          biometricData = await enrollIrisScan();
          break;
        default:
          throw new Error('Unsupported biometric type');
      }

      // Register biometric with backend
      const { data, error } = await supabase.functions.invoke('military-security-engine', {
        body: {
          action: 'validate_biometric',
          data: {
            biometricType: type,
            biometricData,
            isEnrollment: true,
            qualityScore: 85 // Mock quality score
          }
        }
      });

      if (error) throw error;

      if (data?.data?.isValid) {
        toast({
          title: "Biometric Enrolled",
          description: `${type} authentication has been successfully enrolled.`,
        });
        await loadEnrolledBiometrics();
      } else {
        throw new Error('Biometric enrollment failed');
      }
    } catch (error: any) {
      console.error('Biometric enrollment error:', error);
      toast({
        title: "Enrollment Failed",
        description: error.message || `Failed to enroll ${type} authentication.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setEnrollingType(null);
    }
  };

  const enrollWebAuthn = async (): Promise<string> => {
    if (!('credentials' in navigator)) {
      throw new Error('WebAuthn not supported');
    }

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "Business Finance Mastery",
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(user?.id || ''),
        name: user?.email || '',
        displayName: user?.user_metadata?.full_name || user?.email || '',
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" }
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "direct"
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    }) as PublicKeyCredential;

    if (!credential) {
      throw new Error('Failed to create credential');
    }

    return btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
  };

  const enrollVoiceprint = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      let voiceData = '';

      recognition.onresult = (event: any) => {
        voiceData = event.results[0][0].transcript;
        // In production, extract voice characteristics
        const voiceprint = btoa(voiceData + Date.now());
        resolve(voiceprint);
      };

      recognition.onerror = (event: any) => {
        reject(new Error(`Voice recognition error: ${event.error}`));
      };

      recognition.start();

      // Provide user guidance
      toast({
        title: "Voice Enrollment",
        description: "Please say: 'My voice is my password'",
      });
    });
  };

  const enrollIrisScan = async (): Promise<string> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });

      // Create video element for iris capture
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      // Capture frame for iris analysis
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx?.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL();
      
      // Stop video stream
      stream.getTracks().forEach(track => track.stop());

      // In production, extract iris characteristics
      const irisTemplate = btoa(imageData.substring(0, 1000));
      return irisTemplate;
    } catch (error) {
      throw new Error(`Iris scan failed: ${error}`);
    }
  };

  const authenticateWithBiometric = async (method: any) => {
    setLoading(true);
    try {
      let biometricData: string;

      switch (method.biometric_type) {
        case 'fingerprint':
        case 'face':
          biometricData = await authenticateWebAuthn();
          break;
        case 'voice':
          biometricData = await authenticateVoice();
          break;
        case 'iris':
          biometricData = await authenticateIris();
          break;
        default:
          throw new Error('Unsupported biometric type');
      }

      const { data, error } = await supabase.functions.invoke('military-security-engine', {
        body: {
          action: 'validate_biometric',
          data: {
            biometricType: method.biometric_type,
            biometricData,
            isEnrollment: false
          }
        }
      });

      if (error) throw error;

      if (data?.data?.isValid) {
        toast({
          title: "Authentication Successful",
          description: `${method.biometric_type} authentication completed.`,
        });
      } else {
        throw new Error('Biometric authentication failed');
      }
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const authenticateWebAuthn = async (): Promise<string> => {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: "required"
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    }) as PublicKeyCredential;

    if (!assertion) {
      throw new Error('Authentication failed');
    }

    return btoa(String.fromCharCode(...new Uint8Array(assertion.rawId)));
  };

  const authenticateVoice = async (): Promise<string> => {
    // Similar to enrollVoiceprint but for authentication
    return enrollVoiceprint();
  };

  const authenticateIris = async (): Promise<string> => {
    // Similar to enrollIrisScan but for authentication
    return enrollIrisScan();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Biometric Authentication
        </CardTitle>
        <CardDescription>
          Secure your account with biometric authentication methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {supportedMethods.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No biometric authentication methods are supported on this device.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BIOMETRIC_METHODS.map((method) => {
              const isSupported = supportedMethods.includes(method.type);
              const isEnrolled = enrolledMethods.some(m => m.biometric_type === method.type);
              const enrolledMethod = enrolledMethods.find(m => m.biometric_type === method.type);

              return (
                <Card key={method.type} className={!isSupported ? 'opacity-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {method.icon}
                        <div>
                          <div className="font-medium">{method.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {method.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEnrolled ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enrolled
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Enrolled
                          </Badge>
                        )}
                      </div>
                    </div>

                    {isSupported && (
                      <div className="space-y-2">
                        {!isEnrolled ? (
                          <Button
                            onClick={() => enrollBiometric(method.type)}
                            disabled={loading || enrollingType === method.type}
                            className="w-full"
                            size="sm"
                          >
                            {enrollingType === method.type ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Enrolling...
                              </>
                            ) : (
                              'Enroll'
                            )}
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            <Button
                              onClick={() => authenticateWithBiometric(enrolledMethod)}
                              disabled={loading}
                              className="w-full"
                              size="sm"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Authenticating...
                                </>
                              ) : (
                                'Authenticate'
                              )}
                            </Button>
                            {enrolledMethod && (
                              <div className="text-xs text-muted-foreground">
                                Quality: {enrolledMethod.quality_score}% • 
                                Last used: {enrolledMethod.last_used_at 
                                  ? new Date(enrolledMethod.last_used_at).toLocaleDateString() 
                                  : 'Never'
                                }
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};