import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Activity, 
  Users, 
  Zap,
  Target,
  Bell,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useToast } from '@/hooks/use-toast';

interface ThreatAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  created_at: string;
  is_resolved: boolean;
  metadata: any;
}

interface ThreatMetrics {
  activeThreats: number;
  blockedAttempts: number;
  suspiciousIPs: number;
  dataAccessAttempts: number;
  mfaBypassAttempts: number;
  realTimeAlerts: ThreatAlert[];
}

export const RealTimeThreatMonitor: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminRole();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<ThreatMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (user && !adminLoading && isAdmin) {
      loadThreatData();
      startRealTimeMonitoring();
    }
  }, [user, adminLoading, isAdmin]);

  const loadThreatData = async () => {
    setLoading(true);
    try {
      // Load critical security alerts from last 24 hours
      const { data: alertsData } = await supabase
        .from('security_alerts')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      // Load security events for metrics
      const { data: eventsData } = await supabase
        .from('security_events')
        .select('*')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .order('created_at', { ascending: false });

      const alerts = alertsData || [];
      const events = eventsData || [];

      // Calculate threat metrics
      const activeThreats = alerts.filter(a => !a.is_resolved && a.severity === 'critical').length;
      const blockedAttempts = events.filter(e => 
        e.event_type.includes('blocked') || e.event_type.includes('denied')
      ).length;
      
      // Safe IP address extraction with proper type checking
      const ipAddresses = events
        .filter(e => e.details && typeof e.details === 'object' && e.details !== null)
        .map(e => {
          const details = e.details as any;
          return details.ip_address;
        })
        .filter(Boolean);
      
      const suspiciousIPs = new Set(ipAddresses).size;
      const dataAccessAttempts = events.filter(e => 
        e.event_type.includes('profile_data_access') || 
        e.event_type.includes('unauthorized')
      ).length;
      const mfaBypassAttempts = events.filter(e => 
        e.event_type.includes('mfa_access_attempt') || 
        e.event_type.includes('biometric_access_attempt')
      ).length;

      setMetrics({
        activeThreats,
        blockedAttempts,
        suspiciousIPs,
        dataAccessAttempts,
        mfaBypassAttempts,
        realTimeAlerts: alerts
      });

      // Show critical alerts as toast notifications
      const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.is_resolved);
      criticalAlerts.forEach(alert => {
        toast({
          title: `🚨 CRITICAL THREAT: ${alert.title}`,
          description: alert.description,
          variant: "destructive",
        });
      });

    } catch (error) {
      // Secure error logging - removed console.error for production
      await supabase.rpc('log_critical_security_event', {
        event_name: 'threat_monitor_load_error',
        severity_level: 'medium',
        event_details: {
          error_type: 'data_loading_failure',
          component: 'RealTimeThreatMonitor'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const startRealTimeMonitoring = () => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    
    // Subscribe to real-time security alerts
    const alertsChannel = supabase
      .channel('security-alerts-realtime')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'security_alerts' 
        }, 
        (payload) => {
          const newAlert = payload.new as ThreatAlert;
          
          // Update metrics with new alert
          setMetrics(prev => prev ? {
            ...prev,
            activeThreats: prev.activeThreats + (newAlert.severity === 'critical' ? 1 : 0),
            realTimeAlerts: [newAlert, ...prev.realTimeAlerts.slice(0, 19)]
          } : null);

          // Show real-time toast for critical alerts
          if (newAlert.severity === 'critical') {
            toast({
              title: `🚨 REAL-TIME THREAT: ${newAlert.title}`,
              description: newAlert.description,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    // Subscribe to real-time security events
    const eventsChannel = supabase
      .channel('security-events-realtime')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_events'
        },
        (payload) => {
          const newEvent = payload.new;
          
          // Update relevant metrics based on event type
          setMetrics(prev => {
            if (!prev) return null;
            
            const updates: Partial<ThreatMetrics> = {};
            
            if (newEvent.event_type?.includes('blocked') || newEvent.event_type?.includes('denied')) {
              updates.blockedAttempts = prev.blockedAttempts + 1;
            }
            
            if (newEvent.event_type?.includes('profile_data_access') || newEvent.event_type?.includes('unauthorized')) {
              updates.dataAccessAttempts = prev.dataAccessAttempts + 1;
            }
            
            if (newEvent.event_type?.includes('mfa_access_attempt') || newEvent.event_type?.includes('biometric_access_attempt')) {
              updates.mfaBypassAttempts = prev.mfaBypassAttempts + 1;
            }
            
            return { ...prev, ...updates };
          });

          // Show warning for suspicious events
          if (newEvent.severity === 'critical' || newEvent.severity === 'high') {
            toast({
              title: `⚠️ Security Event: ${newEvent.event_type}`,
              description: `Severity: ${newEvent.severity}`,
              variant: newEvent.severity === 'critical' ? "destructive" : "default",
            });
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(eventsChannel);
      setIsMonitoring(false);
    };
  };

  const runThreatDetection = async () => {
    try {
      toast({
        title: "Running Threat Detection",
        description: "Analyzing security patterns...",
      });

      // Use the new real-time threat detection function
      await supabase.rpc('detect_real_time_threats');
      
      // Also run comprehensive analysis
      await supabase.rpc('run_comprehensive_security_analysis');
      
      // Reload data to show results
      await loadThreatData();
      
      toast({
        title: "Threat Detection Complete",
        description: "Real-time security analysis completed successfully.",
      });
    } catch (error) {
      console.error('Error running threat detection:', error);
      toast({
        title: "Threat Detection Failed",
        description: "Failed to run security analysis.",
        variant: "destructive"
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await supabase
        .from('security_alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id 
        })
        .eq('id', alertId);
      
      await loadThreatData();
      
      toast({
        title: "Alert Resolved",
        description: "Security alert has been marked as resolved.",
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
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

  const getThreatLevelColor = (count: number, threshold: { low: number; medium: number }) => {
    if (count >= threshold.medium) return 'destructive';
    if (count >= threshold.low) return 'default';
    return 'secondary';
  };

  if (adminLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Real-Time Threat Monitor
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

  if (!user || !isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Admin privileges required to access real-time threat monitoring.
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
            Real-Time Threat Monitor
            {isMonitoring && <Badge variant="default" className="ml-2">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>}
          </CardTitle>
          <CardDescription>
            Advanced threat detection and real-time security monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Real-Time Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Threats</p>
                    <p className="text-2xl font-bold text-red-600">{metrics?.activeThreats || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Blocked Attempts</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics?.blockedAttempts || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Suspicious IPs</p>
                    <p className="text-2xl font-bold text-orange-600">{metrics?.suspiciousIPs || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data Access</p>
                    <p className="text-2xl font-bold text-purple-600">{metrics?.dataAccessAttempts || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">MFA Bypass</p>
                    <p className="text-2xl font-bold text-yellow-600">{metrics?.mfaBypassAttempts || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={runThreatDetection} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Run Threat Analysis
            </Button>
            <Button 
              onClick={loadThreatData} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>

          {/* Real-Time Alerts */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Real-Time Security Alerts (Last 24h)
            </h3>
            
            {!metrics?.realTimeAlerts?.length ? (
              <p className="text-muted-foreground">No security alerts detected.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {metrics.realTimeAlerts.map((alert) => (
                  <Alert key={alert.id} className={alert.is_resolved ? 'opacity-60' : ''}>
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
                          {alert.metadata?.automated_detection && (
                            <Badge variant="secondary">Auto-Detected</Badge>
                          )}
                        </div>
                        <AlertDescription>{alert.description}</AlertDescription>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString()}
                          {alert.metadata?.threat_level && (
                            <> • Threat Level: {alert.metadata.threat_level}</>
                          )}
                        </p>
                      </div>
                      {!alert.is_resolved && (
                        <Button 
                          onClick={() => resolveAlert(alert.id)}
                          variant="outline" 
                          size="sm"
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};