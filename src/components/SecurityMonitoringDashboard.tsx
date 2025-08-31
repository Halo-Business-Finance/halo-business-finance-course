import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Eye,
  Users,
  Database,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  metadata: any;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

interface AdminAuditEvent {
  id: string;
  admin_user_id: string;
  action: string;
  target_user_id?: string;
  target_resource: string;
  details: any;
  data_classification: string;
  created_at: string;
}

interface SecurityStats {
  totalAlerts: number;
  criticalAlerts: number;
  piiAccessEvents: number;
  suspiciousActivity: number;
}

export const SecurityMonitoringDashboard = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [auditEvents, setAuditEvents] = useState<AdminAuditEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalAlerts: 0,
    criticalAlerts: 0,
    piiAccessEvents: 0,
    suspiciousActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
    
    // Set up real-time monitoring
    const channel = supabase
      .channel('security-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_alerts'
        },
        (payload) => {
          const newAlert = payload.new as SecurityAlert;
          setAlerts(prev => [newAlert, ...prev]);
          
          if (newAlert.severity === 'critical') {
            toast({
              title: "Critical Security Alert",
              description: newAlert.title,
              variant: "destructive"
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_audit_log'
        },
        (payload) => {
          const newEvent = payload.new as AdminAuditEvent;
          setAuditEvents(prev => [newEvent, ...prev.slice(0, 49)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);

      // Load security alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (alertsError) {
        console.error('Error loading security alerts:', alertsError);
        // Set empty arrays to prevent undefined errors
        setAlerts([]);
        setAuditEvents([]);
        setStats({
          totalAlerts: 0,
          criticalAlerts: 0,
          piiAccessEvents: 0,
          suspiciousActivity: 0
        });
        return;
      }

      // Load admin audit events
      const { data: auditData, error: auditError } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (auditError) {
        console.error('Error loading audit data:', auditError);
        // Continue with alerts data but set audit to empty
        setAlerts(alertsData || []);
        setAuditEvents([]);
        setStats({
          totalAlerts: (alertsData || []).length,
          criticalAlerts: (alertsData || []).filter(a => a.severity === 'critical').length,
          piiAccessEvents: 0,
          suspiciousActivity: (alertsData || []).filter(a => 
            a.alert_type?.includes('suspicious') || a.alert_type?.includes('breach')
          ).length
        });
        return;
      }

      // Set the data with proper fallbacks
      const safeAlertsData = alertsData || [];
      const safeAuditData = auditData || [];
      
      setAlerts(safeAlertsData);
      setAuditEvents(safeAuditData);

      // Calculate stats with safe array access
      const totalAlerts = safeAlertsData.length;
      const criticalAlerts = safeAlertsData.filter(a => a.severity === 'critical').length;
      const piiAccessEvents = safeAuditData.filter(e => 
        e.action?.includes('pii') || e.action?.includes('profile')
      ).length;
      const suspiciousActivity = safeAlertsData.filter(a => 
        a.alert_type?.includes('suspicious') || a.alert_type?.includes('breach')
      ).length;

      setStats({
        totalAlerts,
        criticalAlerts,
        piiAccessEvents,
        suspiciousActivity
      });

    } catch (error: any) {
      console.error('Error loading security data:', error);
      
      // Set safe defaults to prevent render errors
      setAlerts([]);
      setAuditEvents([]);
      setStats({
        totalAlerts: 0,
        criticalAlerts: 0,
        piiAccessEvents: 0,
        suspiciousActivity: 0
      });
      
      toast({
        title: "Error",
        description: "Failed to load security monitoring data. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runSecurityAnalysis = async () => {
    try {
      await supabase.rpc('run_comprehensive_security_analysis');
      await supabase.rpc('run_customer_data_security_monitoring');
      
      toast({
        title: "Security Analysis Complete",
        description: "Comprehensive security analysis has been completed"
      });

      // Reload data to show new alerts
      await loadSecurityData();
    } catch (error: any) {
      console.error('Error running security analysis:', error);
      toast({
        title: "Error",
        description: "Failed to run security analysis",
        variant: "destructive"
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getDataClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'confidential':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Confidential</Badge>;
      case 'restricted':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Restricted</Badge>;
      case 'internal':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Internal</Badge>;
      default:
        return <Badge variant="outline">{classification}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Security Monitoring</h2>
          <p className="text-muted-foreground">Real-time security alerts and audit trails</p>
        </div>
        <Button onClick={runSecurityAnalysis} className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Run Security Analysis
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              All security alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PII Access Events</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.piiAccessEvents}</div>
            <p className="text-xs text-muted-foreground">
              Customer data access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.suspiciousActivity}</div>
            <p className="text-xs text-muted-foreground">
              Potential security issues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Alerts</CardTitle>
          <CardDescription>
            Latest security alerts and incidents requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Security Alerts</h3>
              <p className="text-muted-foreground">
                System is secure with no active alerts
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{alert.title}</h4>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                  {alert.metadata && (
                    <div className="text-xs text-muted-foreground">
                      Alert Type: {alert.alert_type}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Audit Trail</CardTitle>
          <CardDescription>
            Recent administrative actions and data access events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditEvents.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Audit Events</h3>
              <p className="text-muted-foreground">
                No recent administrative actions logged
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="font-medium">{event.action}</div>
                        {event.target_user_id && (
                          <div className="text-xs text-muted-foreground">
                            Target: {event.target_user_id.substring(0, 8)}...
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {event.admin_user_id.substring(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{event.target_resource}</div>
                      </TableCell>
                      <TableCell>
                        {getDataClassificationBadge(event.data_classification)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(event.created_at), 'MMM dd, HH:mm')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};