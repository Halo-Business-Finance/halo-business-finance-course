import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Activity, Eye, Lock, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ThreatStats {
  total_threats: number;
  critical_threats: number;
  auto_blocked: number;
  unique_ips: number;
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
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    loadSecurityData();
    
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

      setThreatStats(data.threat_stats);
      setRecentThreats(data.recent_threats);
      setRecentEvents(data.recent_security_events);
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

  const toggleRealTimeMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    
    if (!isMonitoring) {
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            {recentThreats.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No threats detected</p>
            ) : (
              recentThreats.map((threat) => (
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
                    <Badge variant={getSeverityColor(threat.severity)}>
                      {threat.severity}
                    </Badge>
                    {threat.is_blocked && (
                      <Badge variant="destructive">BLOCKED</Badge>
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
            {recentEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent events</p>
            ) : (
              recentEvents.map((event) => (
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
                  <Badge variant={getSeverityColor(event.severity)}>
                    {event.severity}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};