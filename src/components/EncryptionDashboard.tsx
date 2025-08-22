import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Lock, 
  Key,
  Database,
  FileText,
  MessageSquare,
  Users,
  CheckCircle,
  AlertTriangle,
  Activity,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface EncryptionMetrics {
  profilesEncrypted: number;
  totalProfiles: number;
  contentItemsEncrypted: number;
  messagesEncrypted: number;
  encryptionEvents24h: number;
  decryptionEvents24h: number;
  failedOperations24h: number;
  encryptionHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

interface EncryptionEvent {
  id: string;
  event_type: string;
  severity: string;
  details: any;
  created_at: string;
  user_id?: string;
}

export const EncryptionDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<EncryptionMetrics>({
    profilesEncrypted: 0,
    totalProfiles: 0,
    contentItemsEncrypted: 0,
    messagesEncrypted: 0,
    encryptionEvents24h: 0,
    decryptionEvents24h: 0,
    failedOperations24h: 0,
    encryptionHealth: 'excellent'
  });
  const [recentEvents, setRecentEvents] = useState<EncryptionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEncryptionMetrics();
  }, []);

  const loadEncryptionMetrics = async () => {
    try {
      setLoading(true);

      // Get encryption statistics
      const [
        profilesResponse,
        contentResponse,
        messagesResponse,
        eventsResponse
      ] = await Promise.all([
        supabase.from('profiles').select('encryption_status'),
        supabase.from('encrypted_course_content').select('id'),
        supabase.from('encrypted_messages').select('id'),
        supabase
          .from('security_events')
          .select('*')
          .in('event_type', ['data_encrypted', 'data_decrypted', 'decryption_failed'])
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      const profiles = profilesResponse.data || [];
      const encryptedProfiles = profiles.filter(p => p.encryption_status === 'encrypted').length;
      const encryptionEvents = eventsResponse.data || [];
      
      const encryptionEvents24h = encryptionEvents.filter(e => e.event_type === 'data_encrypted').length;
      const decryptionEvents24h = encryptionEvents.filter(e => e.event_type === 'data_decrypted').length;
      const failedOperations24h = encryptionEvents.filter(e => e.event_type === 'decryption_failed').length;

      // Calculate encryption health
      let encryptionHealth: EncryptionMetrics['encryptionHealth'] = 'excellent';
      if (failedOperations24h > 10) {
        encryptionHealth = 'critical';
      } else if (failedOperations24h > 5) {
        encryptionHealth = 'warning';
      } else if (failedOperations24h > 0) {
        encryptionHealth = 'good';
      }

      setMetrics({
        profilesEncrypted: encryptedProfiles,
        totalProfiles: profiles.length,
        contentItemsEncrypted: contentResponse.data?.length || 0,
        messagesEncrypted: messagesResponse.data?.length || 0,
        encryptionEvents24h,
        decryptionEvents24h,
        failedOperations24h,
        encryptionHealth
      });

      setRecentEvents(encryptionEvents.slice(0, 10));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load encryption metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runEncryptionHealthCheck = async () => {
    try {
      const { error } = await supabase.rpc('monitor_encryption_security');

      if (error) throw error;

      toast({
        title: "Success",
        description: "Encryption health check completed",
      });

      loadEncryptionMetrics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to run encryption health check",
        variant: "destructive"
      });
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'warning': return 'outline';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Encryption Dashboard
          </CardTitle>
          <CardDescription>Loading encryption metrics...</CardDescription>
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

  const encryptionPercentage = metrics.totalProfiles > 0 
    ? Math.round((metrics.profilesEncrypted / metrics.totalProfiles) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Encryption Dashboard</h2>
          <p className="text-muted-foreground">Monitor data encryption and security status</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={getHealthBadgeVariant(metrics.encryptionHealth)}
            className={`${getHealthColor(metrics.encryptionHealth)} font-medium`}
          >
            <Shield className="h-3 w-3 mr-1" />
            {metrics.encryptionHealth.toUpperCase()}
          </Badge>
          <Button onClick={runEncryptionHealthCheck} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Health Check
          </Button>
          <Button onClick={loadEncryptionMetrics}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Encryption Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Encryption</p>
                <div className="mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{encryptionPercentage}%</span>
                    <span className="text-sm text-muted-foreground">
                      ({metrics.profilesEncrypted}/{metrics.totalProfiles})
                    </span>
                  </div>
                  <Progress value={encryptionPercentage} className="mt-2" />
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Encrypted Content</p>
                <p className="text-2xl font-bold mt-2">{metrics.contentItemsEncrypted}</p>
                <p className="text-xs text-muted-foreground">Course materials</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Secure Messages</p>
                <p className="text-2xl font-bold mt-2">{metrics.messagesEncrypted}</p>
                <p className="text-xs text-muted-foreground">End-to-end encrypted</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">24h Operations</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Encrypted:</span>
                    <span className="font-medium text-green-600">{metrics.encryptionEvents24h}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Decrypted:</span>
                    <span className="font-medium text-blue-600">{metrics.decryptionEvents24h}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Failed:</span>
                    <span className="font-medium text-red-600">{metrics.failedOperations24h}</span>
                  </div>
                </div>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Alert */}
      {metrics.encryptionHealth === 'critical' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Encryption Issues Detected:</strong> Multiple encryption failures detected in the last 24 hours. 
            Immediate investigation required to ensure data security integrity.
          </AlertDescription>
        </Alert>
      )}

      {metrics.encryptionHealth === 'warning' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> Some encryption operations have failed recently. 
            Monitor the system for potential issues.
          </AlertDescription>
        </Alert>
      )}

      {metrics.profilesEncrypted === 0 && metrics.totalProfiles > 0 && (
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            <strong>Encryption Available:</strong> Your LMS now supports data encryption. 
            Consider migrating sensitive user data to encrypted storage for enhanced security.
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Encryption Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Encryption Activity
          </CardTitle>
          <CardDescription>
            Latest encryption, decryption, and security events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent encryption activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      event.event_type === 'data_encrypted' 
                        ? 'bg-green-100 text-green-600' 
                        : event.event_type === 'data_decrypted'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {event.event_type === 'data_encrypted' && <Lock className="h-4 w-4" />}
                      {event.event_type === 'data_decrypted' && <Key className="h-4 w-4" />}
                      {event.event_type === 'decryption_failed' && <AlertTriangle className="h-4 w-4" />}
                    </div>
                    
                    <div>
                      <p className="font-medium">
                        {event.event_type === 'data_encrypted' && 'Data Encrypted'}
                        {event.event_type === 'data_decrypted' && 'Data Decrypted'}
                        {event.event_type === 'decryption_failed' && 'Decryption Failed'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Context: {event.details?.context || 'General'}
                        {event.details?.data_length && ` • ${event.details.data_length} chars`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant={event.severity === 'high' ? 'destructive' : 'secondary'}
                      className="mb-1"
                    >
                      {event.severity}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Encryption Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">PII Encryption</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Access Logging</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rate Limiting</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-Decryption</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Content Encryption</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Integrity Verification</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Access Control</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Audit Trail</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Secure Communications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">End-to-End Encryption</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Message Expiration</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Identity Verification</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tamper Detection</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};