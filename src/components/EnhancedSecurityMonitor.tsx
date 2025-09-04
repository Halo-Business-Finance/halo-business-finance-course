import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Eye, RefreshCw, Users, Database, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SecurityStatusIndicator } from './SecurityStatusIndicator';

interface SecurityMetrics {
  totalAdminActions: number;
  recentAlerts: number;
  dataAccessCount: number;
  lastSecurityScan: string;
  integrityScore: number;
  criticalIssues: number;
}

export const EnhancedSecurityMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanRunning, setScanRunning] = useState(false);

  const fetchSecurityMetrics = async () => {
    try {
      // Get comprehensive security metrics
      const { data: auditStats, error: auditError } = await supabase.rpc('verify_audit_integrity');
      
      if (auditError) throw auditError;

      // Get recent security events count
      const { count: recentEvents, error: eventsError } = await supabase
        .from('security_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (eventsError) throw eventsError;

      // Get admin audit log count
      const { count: adminActions, error: adminError } = await supabase
        .from('admin_audit_log')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (adminError) throw adminError;

      const auditStatsData = auditStats as any;
      
      setMetrics({
        totalAdminActions: adminActions || 0,
        recentAlerts: recentEvents || 0,
        dataAccessCount: auditStatsData?.audit_statistics?.total_admin_actions || 0,
        lastSecurityScan: new Date().toISOString(),
        integrityScore: auditStatsData?.integrity_score || 0,
        criticalIssues: auditStatsData?.audit_statistics?.recent_anomalies || 0
      });

    } catch (error) {
      console.error('Error fetching security metrics:', error);
      toast({
        title: "Security Monitor Error",
        description: "Failed to fetch security metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runSecurityScan = async () => {
    setScanRunning(true);
    try {
      // Run comprehensive security analysis
      await supabase.rpc('run_comprehensive_security_analysis');
      
      toast({
        title: "Security Scan Complete",
        description: "Comprehensive security analysis has been executed",
        variant: "default"
      });

      // Refresh metrics after scan
      await fetchSecurityMetrics();
      
    } catch (error) {
      console.error('Error running security scan:', error);
      toast({
        title: "Security Scan Failed",
        description: "Failed to execute security analysis",
        variant: "destructive"
      });
    } finally {
      setScanRunning(false);
    }
  };

  useEffect(() => {
    fetchSecurityMetrics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchSecurityMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading security metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSecurityStatus = () => {
    if (!metrics) return 'warning';
    if (metrics.criticalIssues > 0) return 'warning';
    if (metrics.integrityScore >= 80) return 'secure';
    if (metrics.integrityScore >= 50) return 'masked';
    return 'protected';
  };

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Enhanced Security Monitor
              </CardTitle>
              <CardDescription>
                Real-time security monitoring and audit compliance
              </CardDescription>
            </div>
            <SecurityStatusIndicator 
              level={getSecurityStatus()}
              message={`Integrity Score: ${metrics?.integrityScore || 0}%`}
              size="lg"
            />
          </div>
        </CardHeader>
        <CardContent>
          {metrics?.criticalIssues > 0 && (
            <Alert className="mb-4 border-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Critical Security Issues Detected:</strong> {metrics.criticalIssues} issues require immediate attention.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Admin Activity */}
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">Admin Activity</span>
              </div>
              <div className="text-2xl font-bold">{metrics?.totalAdminActions || 0}</div>
              <div className="text-sm text-muted-foreground">Last 7 days</div>
            </div>

            {/* Data Access Events */}
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-primary" />
                <span className="font-medium">Data Access</span>
              </div>
              <div className="text-2xl font-bold">{metrics?.dataAccessCount || 0}</div>
              <div className="text-sm text-muted-foreground">Total operations</div>
            </div>

            {/* Security Alerts */}
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <span className="font-medium">Recent Alerts</span>
              </div>
              <div className="text-2xl font-bold">{metrics?.recentAlerts || 0}</div>
              <div className="text-sm text-muted-foreground">Last 24 hours</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Last scan: {metrics?.lastSecurityScan ? new Date(metrics.lastSecurityScan).toLocaleString() : 'Never'}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchSecurityMetrics}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                size="sm" 
                onClick={runSecurityScan}
                disabled={scanRunning}
              >
                <Shield className="h-4 w-4 mr-2" />
                {scanRunning ? 'Scanning...' : 'Run Security Scan'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <div className="font-medium">Customer Data Access</div>
                <div className="text-sm text-muted-foreground">
                  All customer data access is logged and monitored. Only access data when necessary for legitimate business purposes.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <div className="font-medium">Data Masking</div>
                <div className="text-sm text-muted-foreground">
                  Sensitive data is automatically masked based on your role. Super admins see full data with enhanced logging.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <div className="font-medium">Audit Compliance</div>
                <div className="text-sm text-muted-foreground">
                  All administrative actions are logged for compliance and security auditing purposes.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};