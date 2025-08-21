import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Eye, Lock, Activity, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';

interface SecurityMetrics {
  totalSessions: number;
  activeSessions: number;
  failedLogins: number;
  suspiciousActivities: number;
  mfaEnabled: number;
  biometricsEnabled: number;
  recentAlerts: SecurityAlert[];
}

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  created_at: string;
  is_resolved: boolean;
}

interface SessionInfo {
  id: string;
  device_id: string;
  created_at: string;
  last_activity_at: string;
  is_active: boolean;
  session_type: string;
  risk_score: number;
  security_level: number;
}

export const EnhancedSecurityMonitor: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminRole();
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user && !adminLoading) {
      loadSecurityData();
    }
  }, [user, adminLoading]);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      // Load security metrics
      const { data: alertsData } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Load session information based on user role
      let sessionsData: SessionInfo[] = [];
      if (isAdmin) {
        const { data } = await supabase.rpc('get_admin_session_info');
        sessionsData = data || [];
      } else {
        const { data } = await supabase.rpc('get_user_session_info');
        sessionsData = data || [];
      }

      // Calculate metrics
      const activeSessions = sessionsData.filter(s => s.is_active).length;
      const highRiskSessions = sessionsData.filter(s => s.risk_score > 7).length;

      setMetrics({
        totalSessions: sessionsData.length,
        activeSessions,
        failedLogins: 0, // Would come from security events
        suspiciousActivities: highRiskSessions,
        mfaEnabled: 0, // Would come from user_mfa table
        biometricsEnabled: 0, // Would come from user_biometrics table
        recentAlerts: alertsData || []
      });

      setSessions(sessionsData);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSecurityLevelBadge = (level: number) => {
    if (level >= 8) return { variant: 'default' as const, text: 'High Security' };
    if (level >= 5) return { variant: 'secondary' as const, text: 'Medium Security' };
    return { variant: 'destructive' as const, text: 'Low Security' };
  };

  const getRiskScoreBadge = (score: number) => {
    if (score <= 3) return { variant: 'default' as const, text: 'Low Risk' };
    if (score <= 6) return { variant: 'secondary' as const, text: 'Medium Risk' };
    return { variant: 'destructive' as const, text: 'High Risk' };
  };

  if (adminLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please sign in to access security monitoring.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enhanced Security Monitor
          </CardTitle>
          <CardDescription>
            Real-time security monitoring and threat detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Active Sessions</p>
                        <p className="text-2xl font-bold">{metrics?.activeSessions || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Suspicious Activities</p>
                        <p className="text-2xl font-bold">{metrics?.suspiciousActivities || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">MFA Enabled</p>
                        <p className="text-2xl font-bold">{metrics?.mfaEnabled || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Recent Alerts</p>
                        <p className="text-2xl font-bold">{metrics?.recentAlerts?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Session Management</h3>
                {sessions.length === 0 ? (
                  <p className="text-muted-foreground">No sessions found.</p>
                ) : (
                  sessions.map((session) => (
                    <Card key={session.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={session.is_active ? 'default' : 'secondary'}>
                                {session.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant={getSecurityLevelBadge(session.security_level).variant}>
                                {getSecurityLevelBadge(session.security_level).text}
                              </Badge>
                              <Badge variant={getRiskScoreBadge(session.risk_score).variant}>
                                {getRiskScoreBadge(session.risk_score).text}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Session Type: {session.session_type} • Created: {new Date(session.created_at).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Last Activity: {new Date(session.last_activity_at).toLocaleString()}
                            </p>
                          </div>
                          <Activity className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Security Alerts</h3>
                {metrics?.recentAlerts.length === 0 ? (
                  <p className="text-muted-foreground">No recent security alerts.</p>
                ) : (
                  metrics?.recentAlerts.map((alert) => (
                    <Alert key={alert.id}>
                      <AlertTriangle className="h-4 w-4" />
                      <div className="flex items-start justify-between w-full">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{alert.title}</span>
                            <Badge variant={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            {alert.is_resolved && (
                              <Badge variant="outline">Resolved</Badge>
                            )}
                          </div>
                          <AlertDescription>{alert.description}</AlertDescription>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Alert>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Security Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={loadSecurityData} 
                    variant="outline"
                    className="w-full"
                  >
                    Refresh Security Data
                  </Button>
                  {isAdmin && (
                    <Button 
                      onClick={() => window.open('/admin/security', '_blank')} 
                      variant="default"
                      className="w-full"
                    >
                      Advanced Security Dashboard
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSecurityMonitor;