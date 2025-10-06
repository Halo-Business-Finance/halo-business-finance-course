import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Activity, Eye, Lock, Zap, Settings, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ThreatStats {
  total_threats: number;
  critical_threats: number;
  auto_blocked: number;
  unique_ips: number;
  total_anomalies?: number;
  critical_anomalies?: number;
  recent_anomalies?: number;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  created_at: string;
  details: any;
}

interface ThreatEvent {
  id: string;
  event_type: string;
  severity: string;
  source_ip: string;
  is_blocked: boolean;
  created_at: string;
  threat_indicators: any;
}

export const SecurityDashboard = () => {
  const [threatStats, setThreatStats] = useState<ThreatStats | null>(null);
  const [recentThreats, setRecentThreats] = useState<ThreatEvent[]>([]);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [remediating, setRemediating] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    loadSecurityData();
    loadMonitoringState();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('military-security-monitor', {
        body: { action: 'security_dashboard_data' }
      });

      if (error) throw error;

      setThreatStats(data?.threat_stats || null);
      setRecentThreats(data?.recent_threats || []);
      setRecentEvents(data?.recent_security_events || []);

      // Also load anomaly statistics
      try {
        const { data: anomalyData } = await supabase.functions.invoke('anomaly-detector', {
          body: { action: 'get_anomaly_stats' }
        });
        
        const anomalyResult = await anomalyData;
        if (anomalyResult.success) {
          // Merge anomaly stats with threat stats
          setThreatStats(prev => ({
            ...prev,
            total_anomalies: anomalyResult.stats.total_anomalies,
            critical_anomalies: anomalyResult.stats.critical_anomalies,
            recent_anomalies: anomalyResult.stats.recent_anomalies_24h
          }));
        }
      } catch (anomalyError) {
        console.error('Failed to load anomaly data:', anomalyError);
        // Don't fail the whole dashboard for anomaly data
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
      toast({
        title: "Security Dashboard Error",
        description: "Failed to load security monitoring data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMonitoringState = async () => {
    try {
      // Check localStorage first for immediate response
      const localState = localStorage.getItem('military-monitoring-active');
      if (localState !== null) {
        setIsMonitoring(localState === 'true');
      }

      // Then check database for authoritative state
      const { data, error } = await supabase
        .from('cms_settings')
        .select('value')
        .eq('key', 'military_monitoring_active')
        .maybeSingle();

      if (!error && data) {
        const dbState = data.value === 'true';
        setIsMonitoring(dbState);
        localStorage.setItem('military-monitoring-active', dbState.toString());
      }
    } catch (error) {
      console.error('Failed to load monitoring state:', error);
    }
  };

  const saveMonitoringState = async (newState: boolean) => {
    try {
      // Save to localStorage immediately
      localStorage.setItem('military-monitoring-active', newState.toString());
      
      // Save to database
      const { error } = await supabase
        .from('cms_settings')
        .upsert({
          key: 'military_monitoring_active',
          value: newState.toString(),
          category: 'security',
          description: 'Military-grade security monitoring status'
        }, {
          onConflict: 'key'
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to save monitoring state:', error);
      toast({
        title: "Warning",
        description: "Monitoring state may not persist across sessions",
        variant: "destructive"
      });
    }
  };

  const toggleRealTimeMonitoring = async () => {
    const newState = !isMonitoring;
    setIsMonitoring(newState);
    
    // Save the state
    await saveMonitoringState(newState);
    
    if (newState) {
      toast({
        title: "Real-time Monitoring Activated",
        description: "Military-grade threat detection is now active",
      });
    } else {
      toast({
        title: "Monitoring Paused",
        description: "Real-time threat detection has been paused",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const remediateThreat = async (threat: ThreatEvent, actionType: string) => {
    setRemediating(threat.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('military-security-monitor', {
        body: { 
          action: 'remediate_threat',
          threat_id: threat.id,
          action_type: actionType,
          target_ip: threat.source_ip
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Threat Remediated",
          description: data.message,
        });
        
        // Reload security data to reflect changes
        loadSecurityData();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: "Remediation Failed",
        description: error.message || "Failed to remediate threat",
        variant: "destructive"
      });
    } finally {
      setRemediating(null);
    }
  };

  const getRemediationActions = (threat: ThreatEvent) => {
    const actions = [];
    
    if (threat.severity === 'critical' || threat.severity === 'high') {
      actions.push({
        label: 'Block IP',
        action: 'block_ip',
        variant: 'destructive' as const,
        description: 'Block this IP address for 24 hours'
      });
      
      actions.push({
        label: 'Clear Sessions',
        action: 'clear_sessions', 
        variant: 'outline' as const,
        description: 'Terminate all sessions from this IP'
      });
    }
    
    if (!threat.is_blocked) {
      actions.push({
        label: 'Auto Remediate',
        action: 'auto_remediate',
        variant: 'default' as const,
        description: 'Apply automatic remediation based on threat level'
      });
    }
    
    actions.push({
      label: 'Enhanced Monitor',
      action: 'enable_enhanced_monitoring',
      variant: 'secondary' as const,
      description: 'Enable enhanced monitoring for 72 hours'
    });
    
    return actions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Military-Grade Security Center</h2>
          <p className="text-muted-foreground">Advanced threat detection and monitoring</p>
        </div>
        <Button
          onClick={toggleRealTimeMonitoring}
          variant={isMonitoring ? "destructive" : "default"}
          className="flex items-center gap-2"
        >
          {isMonitoring ? <Lock className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
          {isMonitoring ? "Monitoring Active" : "Activate Monitoring"}
        </Button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Threats (24h)</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{threatStats?.total_threats || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {threatStats?.critical_threats || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Anomalies</CardTitle>
            <Eye className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {threatStats?.total_anomalies || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Blocked</CardTitle>
            <Lock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {threatStats?.auto_blocked || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{threatStats?.unique_ips || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {threatStats && threatStats.critical_threats > 0 && (
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>CRITICAL SECURITY ALERT:</strong> {threatStats.critical_threats} critical threats 
            detected in the last 24 hours. Immediate attention required.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Threat Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Threat Events
            </CardTitle>
            <CardDescription>
              Latest security threats detected by military-grade monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(recentThreats || []).length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No threats detected</p>
            ) : (
              (recentThreats || []).map((threat) => (
                <div key={threat.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(threat.severity)}
                    <div>
                      <p className="font-medium">{threat.event_type}</p>
                      <p className="text-sm text-muted-foreground">
                        IP: {threat.source_ip} • {new Date(threat.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium capitalize ${
                      threat.severity === 'critical' ? 'text-destructive' : 
                      threat.severity === 'high' ? 'text-orange-600' : 
                      'text-yellow-600'
                    }`}>
                      {threat.severity}
                    </span>
                    {threat.is_blocked ? (
                      <span className="text-sm font-medium text-destructive">BLOCKED</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        {getRemediationActions(threat).slice(0, 2).map((action) => (
                          <Button
                            key={action.action}
                            variant={action.variant}
                            size="sm"
                            onClick={() => remediateThreat(threat, action.action)}
                            disabled={remediating === threat.id}
                            className="px-2 py-1 text-xs"
                            title={action.description}
                          >
                            {remediating === threat.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-current" />
                            ) : action.action === 'auto_remediate' ? (
                              <Settings className="h-3 w-3" />
                            ) : action.action === 'block_ip' ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Security Activity Log
            </CardTitle>
            <CardDescription>
              System security events and user activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(recentEvents || []).length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent events</p>
            ) : (
              (recentEvents || []).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(event.severity)}
                    <div>
                      <p className="font-medium">{event.event_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium capitalize ${
                    event.severity === 'critical' ? 'text-destructive' : 
                    event.severity === 'high' ? 'text-orange-600' : 
                    'text-yellow-600'
                  }`}>
                    {event.severity}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};