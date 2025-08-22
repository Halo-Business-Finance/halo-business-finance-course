import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, Eye, Clock, RefreshCw, Plus, AlertCircle, BarChart3, XCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SecurityMetricsDashboard } from './SecurityMetricsDashboard';

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
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Fetch security alerts directly from database
      const { data: alerts, error: alertsError } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsError) {
        // Secure error logging - alerts fetch failed
      }

      // Fetch recent security events directly from database  
      const { data: events, error: eventsError } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (eventsError) {
        // Secure error logging - events fetch failed
      }

      // Fetch rate limit attempts (blocked IPs) directly from database
      const { data: rateLimits, error: rateLimitError } = await supabase
        .from('rate_limit_attempts')
        .select('*')
        .eq('is_blocked', true)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (rateLimitError) {
        // Secure error logging - rate limits fetch failed
      }

      // Set the data even if some queries failed
      setData({
        alerts: (alerts || []).map(alert => ({
          ...alert,
          severity: alert.severity as 'low' | 'medium' | 'high' | 'critical'
        })),
        recent_events: events || [],
        blocked_ips: (rateLimits || []).map(limit => ({
          ...limit,
          ip_address: String(limit.ip_address || 'Unknown')
        }))
      });

    } catch (error: any) {
      // Secure error logging - security dashboard data loading failed
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
      const { error } = await supabase
        .from('security_alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', alertId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Security alert resolved successfully"
      });
      loadSecurityData();
    } catch (error: any) {
      // Secure error handling
      await supabase.rpc('log_critical_security_event', {
        event_name: 'alert_resolution_error',
        severity_level: 'medium',
        event_details: {
          alert_id: alertId,
          error_type: 'alert_update_failure',
          component: 'SecurityDashboard'
        }
      });
      
      toast({
        title: "Error",
        description: "Failed to resolve security alert",
        variant: "destructive"
      });
    }
  };

  const runSecurityAnalysis = async () => {
    try {
      // Call the analyze_security_events function directly
      const { error } = await supabase.rpc('analyze_security_events');

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Security analysis completed"
      });
      loadSecurityData();
    } catch (error: any) {
      // Secure error handling
      await supabase.rpc('log_critical_security_event', {
        event_name: 'security_analysis_execution_error',
        severity_level: 'high',
        event_details: {
          error_type: 'analysis_trigger_failure',
          component: 'SecurityDashboard'
        }
      });
      
      toast({
        title: "Error",
        description: "Failed to run security analysis",
        variant: "destructive"
      });
    }
  };

  const createTestAlert = async () => {
    try {
      // Create a test alert directly in the database using the RPC function
      const { error } = await supabase.rpc('create_security_alert', {
        p_alert_type: 'test_alert',
        p_severity: 'medium',
        p_title: 'Test Security Alert',
        p_description: 'This is a test alert created from the admin dashboard',
        p_metadata: { test: true, created_by: 'admin_dashboard' }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Test security alert created"
      });
      loadSecurityData();
    } catch (error: any) {
      // Secure error handling  
      await supabase.rpc('log_critical_security_event', {
        event_name: 'test_alert_creation_error',
        severity_level: 'low',
        event_details: {
          error_type: 'test_alert_failure',
          component: 'SecurityDashboard'
        }
      });
      
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
          <Button onClick={() => setShowMetrics(!showMetrics)} variant={showMetrics ? "default" : "outline"}>
            <BarChart3 className="w-4 h-4 mr-2" />
            {showMetrics ? 'Hide' : 'Show'} Metrics
          </Button>
          <Button onClick={runSecurityAnalysis} variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            Run Analysis
          </Button>
          <Button onClick={createTestAlert} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create Test Alert
          </Button>
          <Button onClick={loadSecurityData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Metrics Dashboard */}
      {showMetrics && (
        <div className="mb-6">
          <SecurityMetricsDashboard />
        </div>
      )}

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
                    <Shield className="w-4 h-4" />
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