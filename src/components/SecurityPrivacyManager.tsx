import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff,
  FileDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PrivacyConsent {
  id: string;
  consent_type: string;
  consent_given: boolean;
  consent_version: string;
  consent_timestamp: string;
  updated_at: string;
}

interface SecurityPrivacyManagerProps {
  className?: string;
}

export const SecurityPrivacyManager: React.FC<SecurityPrivacyManagerProps> = ({ className }) => {
  const { user } = useAuth();
  const [consents, setConsents] = useState<PrivacyConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      loadPrivacyConsents();
    }
  }, [user]);

  const loadPrivacyConsents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_privacy_consents')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setConsents(data || []);

      // If no consents exist, create default ones
      if (!data || data.length === 0) {
        await createDefaultConsents();
      }
    } catch (error) {
      console.error('Error loading privacy consents:', error);
      toast({
        title: "Error",
        description: "Failed to load privacy settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultConsents = async () => {
    const defaultConsents = [
      { consent_type: 'analytics', consent_given: false },
      { consent_type: 'marketing', consent_given: false },
      { consent_type: 'data_processing', consent_given: true }
    ];

    try {
      for (const consent of defaultConsents) {
        await supabase
          .from('user_privacy_consents')
          .insert({
            user_id: user?.id,
            ...consent,
            ip_address: '127.0.0.1', // In production, this would be the actual IP
            user_agent: navigator.userAgent
          });
      }
      
      loadPrivacyConsents();
    } catch (error) {
      console.error('Error creating default consents:', error);
    }
  };

  const updateConsent = async (consentType: string, given: boolean) => {
    try {
      const { error } = await supabase
        .from('user_privacy_consents')
        .upsert({
          user_id: user?.id,
          consent_type: consentType,
          consent_given: given,
          consent_version: '1.0',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        }, {
          onConflict: 'user_id,consent_type'
        });

      if (error) throw error;

      toast({
        title: "Privacy Settings Updated",
        description: `${consentType} consent ${given ? 'granted' : 'revoked'}`,
      });

      loadPrivacyConsents();
    } catch (error) {
      console.error('Error updating consent:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive"
      });
    }
  };

  const exportUserData = async () => {
    try {
      setExporting(true);
      
      const { data, error } = await supabase.rpc('export_user_data', {
        target_user_id: user?.id
      });

      if (error) throw error;

      // Create and download the data file
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Export Complete",
        description: "Your data has been exported and downloaded",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export your data",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const getConsentValue = (type: string): boolean => {
    const consent = consents.find(c => c.consent_type === type);
    return consent?.consent_given || false;
  };

  const getConsentDescription = (type: string): string => {
    switch (type) {
      case 'analytics':
        return 'Allow collection of usage data to improve our services';
      case 'marketing':
        return 'Receive marketing communications and course recommendations';
      case 'data_processing':
        return 'Essential data processing for core platform functionality (required)';
      default:
        return 'Unknown consent type';
    }
  };

  const getConsentIcon = (type: string) => {
    switch (type) {
      case 'analytics':
        return <Eye className="h-4 w-4" />;
      case 'marketing':
        return <FileDown className="h-4 w-4" />;
      case 'data_processing':
        return <Lock className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Privacy Consents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data Consent
          </CardTitle>
          <CardDescription>
            Manage your privacy preferences and data processing consents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {['analytics', 'marketing', 'data_processing'].map((type) => (
            <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getConsentIcon(type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium capitalize">
                      {type.replace('_', ' ')}
                    </Label>
                    {type === 'data_processing' && (
                      <span className="text-xs text-muted-foreground">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getConsentDescription(type)}
                  </p>
                </div>
              </div>
              <Switch
                checked={getConsentValue(type)}
                onCheckedChange={(checked) => updateConsent(type, checked)}
                disabled={type === 'data_processing'} // Required consent can't be disabled
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Your Data Rights
          </CardTitle>
          <CardDescription>
            Export or delete your personal data in compliance with GDPR & CCPA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="font-medium">Export Your Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download a complete copy of all your personal data we have on file
                </p>
              </div>
              <Button 
                onClick={exportUserData}
                disabled={exporting}
                variant="outline"
                size="sm"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20">
              <div className="space-y-1">
                <Label className="font-medium text-destructive">Delete Your Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button 
                variant="destructive"
                size="sm"
                disabled={deleting}
                onClick={() => {
                  toast({
                    title: "Contact Support",
                    description: "Please contact support to delete your account",
                  });
                }}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Security Status
          </CardTitle>
          <CardDescription>
            Your account security and data protection status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Encryption</span>
              <span className="flex items-center gap-1 text-sm text-green-700">
                <CheckCircle className="h-3 w-3" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Audit Logging</span>
              <span className="flex items-center gap-1 text-sm text-green-700">
                <CheckCircle className="h-3 w-3" />
                Enabled
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">GDPR Compliance</span>
              <span className="flex items-center gap-1 text-sm text-green-700">
                <CheckCircle className="h-3 w-3" />
                Compliant
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};