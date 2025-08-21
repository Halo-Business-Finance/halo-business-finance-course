import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Activity, Ban, RefreshCw, Eye, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SecurityMetrics {
  active_alerts: number;
  failed_logins_24h: number;
  admin_actions_24h: number;
  blocked_ips: number;
  security_score: 'excellent' | 'good' | 'moderate' | 'attention_required';
  last_updated: string;
}

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  created_at: string;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  created_at: string;
  details: any;
}

interface BlockedIP {
  ip_address: string;
  attempt_count: number;
  updated_at: string;
}

interface DashboardData {
  metrics: SecurityMetrics;
  recent_alerts: SecurityAlert[];
  recent_events: SecurityEvent[];
  blocked_ips: BlockedIP[];
}

export const SecurityMetricsDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error: metricsError } = await supabase.functions.invoke('security-metrics');

      if (metricsError) {
        throw new Error(metricsError.message || 'Failed to load security metrics');
      }

      if (result.error) {
        throw new Error(result.error);
      }

      setData(result);
    } catch (err) {
      console.error('Error loading security metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: "Error",
        description: "Failed to load security metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSecurityScoreBadge = (score: string) => {
    const variants = {
      excellent: { variant: 'default' as const, color: 'text-green-600', label: 'Excellent' },
      good: { variant: 'secondary' as const, color: 'text-blue-600', label: 'Good' },
      moderate: { variant: 'outline' as const, color: 'text-yellow-600', label: 'Moderate' },
      attention_required: { variant: 'destructive' as const, color: 'text-red-600', label: 'Attention Required' }
    };
    
    const config = variants[score as keyof typeof variants] || variants.moderate;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        <Shield className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Eye className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Security Metrics Error
          </CardTitle>
          <CardDescription>
            {error || 'Failed to load security data'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadMetrics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { metrics, recent_alerts, recent_events, blocked_ips } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Metrics Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time security monitoring and threat detection
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getSecurityScoreBadge(metrics.security_score)}
          <Button onClick={loadMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.active_alerts}</div>
            <p className="text-xs text-muted-foreground">
              Security incidents requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.failed_logins_24h}</div>
            <p className="text-xs text-muted-foreground">
              Authentication failures in last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Actions (24h)</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.admin_actions_24h}</div>
            <p className="text-xs text-muted-foreground">
              Administrative operations performed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.blocked_ips}</div>
            <p className="text-xs text-muted-foreground">
              IP addresses currently blocked
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Security Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Security Alerts</CardTitle>
            <CardDescription>
              Latest security incidents and threats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent_alerts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No recent security alerts
              </p>
            ) : (
              recent_alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.description.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(alert.created_at)}
                    </p>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Events</CardTitle>
            <CardDescription>
              Latest security-related activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent_events.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No recent security events
              </p>
            ) : (
              recent_events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getSeverityIcon(event.severity)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {event.event_type.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(event.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Blocked IPs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blocked IP Addresses</CardTitle>
            <CardDescription>
              Currently rate-limited IP addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {blocked_ips.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No IP addresses currently blocked
              </p>
            ) : (
              blocked_ips.map((ip, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-mono">{ip.ip_address}</p>
                    <p className="text-xs text-muted-foreground">
                      {ip.attempt_count} failed attempts
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>Blocked:</p>
                    <p>{formatTimestamp(ip.updated_at)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        Last updated: {formatTimestamp(metrics.last_updated)} • Auto-refresh: 30s
      </div>
    </div>
  );
};