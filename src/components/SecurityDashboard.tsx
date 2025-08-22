import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metadata: any;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  details: any;
  created_at: string;
}

interface RateLimitAttempt {
  id: string;
  ip_address: string;
  endpoint: string;
  attempt_count: number;
  is_blocked: boolean;
  created_at: string;
}

interface SecurityDashboardData {
  alerts: SecurityAlert[];
  recent_events: SecurityEvent[];
  blocked_ips: RateLimitAttempt[];
}

export const SecurityDashboard: React.FC = () => {
  const [data, setData] = useState<SecurityDashboardData>({
    alerts: [],
    recent_events: [],
    blocked_ips: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      const { data: dashboardData, error } = await supabase.functions.invoke(
        'security-monitor',
        {
          body: { action: 'get_security_dashboard' }
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (dashboardData?.success) {
        setData(dashboardData.data);
      }
    } catch (error: any) {
      console.error('Error loading security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { data: result, error } = await supabase.functions.invoke(
        'security-monitor',
        {
          body: { 
            action: 'resolve_alert',
            alertId,
            resolvedBy: (await supabase.auth.getUser()).data.user?.id
          }
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (result?.success) {
        toast({
          title: "Success",
          description: "Security alert resolved successfully"
        });
        loadSecurityData();
      }
    } catch (error: any) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve security alert",
        variant: "destructive"
      });
    }
  };

  const runSecurityAnalysis = async () => {
    try {
      const { data: result, error } = await supabase.functions.invoke(
        'security-monitor',
        {
          body: { action: 'analyze_security_events' }
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (result?.success) {
        toast({
          title: "Success",
          description: "Security analysis completed"
        });
        loadSecurityData();
      }
    } catch (error: any) {
      console.error('Error running security analysis:', error);
      toast({
        title: "Error",
        description: "Failed to run security analysis",
        variant: "destructive"
      });
    }
  };

  const createTestAlert = async () => {
    try {
      const { data: result, error } = await supabase.functions.invoke(
        'security-monitor',
        {
          body: { action: 'create_test_alert' }
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (result?.success) {
        toast({
          title: "Success",
          description: "Test security alert created"
        });
        loadSecurityData();
      }
    } catch (error: any) {
      console.error('Error creating test alert:', error);
      toast({
        title: "Error",
        description: "Failed to create test alert",
        variant: "destructive"
      });
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
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
      case 'critical':
      case 'high':
        return <XCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
          </CardTitle>
          <CardDescription>Loading security monitoring data...</CardDescription>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Dashboard</h2>
          <p className="text-muted-foreground">Monitor security events and threats</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runSecurityAnalysis} variant="outline">
            Run Analysis
          </Button>
          <Button onClick={createTestAlert} variant="outline">
            Create Test Alert
          </Button>
          <Button onClick={loadSecurityData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Alerts ({data.alerts.length})
          </CardTitle>
          <CardDescription>Active security threats and anomalies</CardDescription>
        </CardHeader>
        <CardContent>
          {data.alerts.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No active security alerts. System appears to be secure.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getSeverityIcon(alert.severity)}
                      <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{alert.alert_type}</Badge>
                      {alert.is_resolved && (
                        <Badge variant="default">Resolved</Badge>
                      )}
                    </div>
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                      {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                        <span>
                          Metadata: {Object.keys(alert.metadata).length} fields
                        </span>
                      )}
                    </div>
                  </div>
                  {!alert.is_resolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest security-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recent_events.length === 0 ? (
            <p className="text-muted-foreground">No recent security events</p>
          ) : (
            <div className="space-y-2">
              {data.recent_events.slice(0, 10).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <div>
                    <span className="font-medium">{event.event_type}</span>
                    <Badge 
                      variant={getSeverityBadgeVariant(event.severity)} 
                      className="ml-2"
                    >
                      {event.severity}
                    </Badge>
                    {event.details?.user_email && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {event.details.user_email}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blocked IPs */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limited IPs</CardTitle>
          <CardDescription>IP addresses currently blocked due to suspicious activity</CardDescription>
        </CardHeader>
        <CardContent>
          {data.blocked_ips.length === 0 ? (
            <p className="text-muted-foreground">No IP addresses currently blocked</p>
          ) : (
            <div className="space-y-2">
              {data.blocked_ips.map((ip) => (
                <div
                  key={ip.id}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <div>
                    <span className="font-mono">{ip.ip_address}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {ip.endpoint} ({ip.attempt_count} attempts)
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(ip.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;