import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trash2, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown,
  Database,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SecurityEventStats {
  total_security_threats: number;
  critical_threats: number;
  high_severity_events: number;
  admin_pii_access_24h: number;
  routine_events_filtered: number;
}

export const SecurityEventManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SecurityEventStats | null>(null);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);

  const loadSecurityStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_clean_security_stats');
      
      if (error) throw error;
      
      // Parse the returned data properly - the RPC returns a single JSONB object
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setStats(data as unknown as SecurityEventStats);
      }
    } catch (error: any) {
      console.error('Failed to load security stats:', error);
      toast({
        title: "Error",
        description: "Failed to load security statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cleanupRoutineEvents = async () => {
    try {
      setLoading(true);
      
      // Use direct SQL through an edge function for cleanup
      const { data, error } = await supabase.functions.invoke('security-data-retention', {
        body: { action: 'cleanup_routine_events' }
      });
      
      if (error) throw error;
      
      setCleanupResult(`Successfully cleaned up ${data?.deleted_count || 0} routine security events`);
      
      toast({
        title: "Cleanup Complete",
        description: `Removed ${data?.deleted_count || 0} routine events`,
      });
      
      // Reload stats after cleanup
      await loadSecurityStats();
      
    } catch (error: any) {
      console.error('Cleanup failed:', error);
      toast({
        title: "Cleanup Failed",
        description: error.message || "Failed to cleanup routine events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const optimizeMonitoring = async () => {
    try {
      setLoading(true);
      
      // Update security monitoring settings
      const { error } = await supabase
        .from('cms_settings')
        .upsert([
          {
            key: 'security_monitoring_optimized',
            value: 'true',
            category: 'security',
            description: 'Enable optimized security monitoring with reduced noise'
          },
          {
            key: 'developer_tools_detection_rate_limit',
            value: '3600', // 1 hour in seconds
            category: 'security',
            description: 'Rate limit for developer tools detection events'
          },
          {
            key: 'admin_status_check_rate_limit', 
            value: '900', // 15 minutes in seconds
            category: 'security',
            description: 'Rate limit for admin status check events'
          }
        ], {
          onConflict: 'key'
        });

      if (error) throw error;
      
      toast({
        title: "Monitoring Optimized",
        description: "Security monitoring has been optimized to reduce noise",
      });
      
    } catch (error: any) {
      console.error('Optimization failed:', error);
      toast({
        title: "Optimization Failed",
        description: error.message || "Failed to optimize monitoring",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadSecurityStats();
  }, []);

  if (loading && !stats) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Security Event Management
          </CardTitle>
          <CardDescription>
            Manage and optimize security event logging to focus on real threats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Current Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.total_security_threats}</div>
                <div className="text-sm text-muted-foreground">Real Security Threats (24h)</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.critical_threats}</div>
                <div className="text-sm text-muted-foreground">Critical Threats (24h)</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.high_severity_events}</div>
                <div className="text-sm text-muted-foreground">High Severity (7d)</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.admin_pii_access_24h}</div>
                <div className="text-sm text-muted-foreground">Admin PII Access (24h)</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-muted-foreground">{stats.routine_events_filtered}</div>
                <div className="text-sm text-muted-foreground">Routine Events (24h)</div>
              </div>
            </div>
          )}

          {/* Issues and Recommendations */}
          {stats && stats.routine_events_filtered > 1000 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <strong>High Volume Alert:</strong> {stats.routine_events_filtered.toLocaleString()} routine events in 24h. 
                This includes developer tools detection and admin status checks that create noise in your security monitoring.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={cleanupRoutineEvents}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {loading ? 'Cleaning...' : 'Cleanup Routine Events'}
            </Button>
            
            <Button 
              onClick={optimizeMonitoring}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {loading ? 'Optimizing...' : 'Optimize Monitoring'}
            </Button>
            
            <Button 
              onClick={loadSecurityStats}
              disabled={loading}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <TrendingDown className="h-4 w-4" />
              Refresh Stats
            </Button>
          </div>

          {/* Cleanup Result */}
          {cleanupResult && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{cleanupResult}</AlertDescription>
            </Alert>
          )}

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="font-medium">Optimization Recommendations:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-green-600" />
                <span>
                  <strong>Focus on Real Threats:</strong> The system now filters out routine events 
                  (developer tools, admin status checks) and focuses on actual security threats.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Database className="h-4 w-4 mt-0.5 text-blue-600" />
                <span>
                  <strong>Intelligent Rate Limiting:</strong> Routine events are now logged with 
                  intelligent rate limiting to prevent spam while maintaining security oversight.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <TrendingDown className="h-4 w-4 mt-0.5 text-purple-600" />
                <span>
                  <strong>Automatic Cleanup:</strong> Old routine events are automatically cleaned 
                  up after 7 days while keeping security threats for compliance.
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};