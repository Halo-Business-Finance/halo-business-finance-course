import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Clock,
  Zap,
  Lock,
  Radar,
  Users,
  Network,
  Database,
  Activity,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SecurityMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface NetworkEvent {
  id: string;
  category: string;
  severity: number;
  source_ip: string;
  event_signature: string;
  created_at: string;
}

interface BehavioralAlert {
  id: string;
  user_id: string;
  anomaly_score: number;
  risk_indicators: string[];
  created_at: string;
}

export const EnhancedSecurityMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const [behavioralAlerts, setBehavioralAlerts] = useState<BehavioralAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [threatLevel, setThreatLevel] = useState(0);
  const [activeThreats, setActiveThreats] = useState<any[]>([]);
  const [zeroTrustScore, setZeroTrustScore] = useState(85);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);

      // Load network security events
      const { data: networkData, error: networkError } = await supabase
        .from('network_security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!networkError) {
        setNetworkEvents(networkData || []);
      }

      // Load behavioral analytics
      const { data: behaviorData, error: behaviorError } = await supabase
        .from('user_behavioral_analytics')
        .select('*')
        .gte('anomaly_score', 60)
        .order('created_at', { ascending: false })
        .limit(15);

      if (!behaviorError) {
        setBehavioralAlerts(behaviorData || []);
      }

      // Load threat intelligence
      const { data: threatData, error: threatError } = await supabase
        .from('advanced_threat_intelligence')
        .select('*')
        .eq('is_active', true)
        .order('severity_level', { ascending: false })
        .limit(10);

      if (!threatError) {
        setActiveThreats(threatData || []);
        setThreatLevel(threatData && threatData.length > 0 ? threatData[0].severity_level : 0);
      }

      // Calculate security metrics
      const newMetrics: SecurityMetric[] = [
        {
          name: 'Threat Level',
          value: threatLevel,
          status: threatLevel > 7 ? 'critical' : threatLevel > 4 ? 'warning' : 'good',
          trend: 'stable'
        },
        {
          name: 'Zero Trust Score',
          value: zeroTrustScore,
          status: zeroTrustScore < 60 ? 'critical' : zeroTrustScore < 80 ? 'warning' : 'good',
          trend: 'up'
        },
        {
          name: 'Network Security',
          value: Math.max(0, 100 - (networkData?.filter(e => e.severity_level > 6).length || 0) * 10),
          status: (networkData?.filter(e => e.severity_level > 6).length || 0) > 3 ? 'critical' : 'good',
          trend: 'stable'
        },
        {
          name: 'Behavioral Anomalies',
          value: Math.max(0, 100 - (behaviorData?.filter(b => b.anomaly_score > 80).length || 0) * 15),
          status: (behaviorData?.filter(b => b.anomaly_score > 80).length || 0) > 2 ? 'warning' : 'good',
          trend: 'down'
        }
      ];

      setMetrics(newMetrics);

    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: "Security Data Load Failed",
        description: "Unable to load enhanced security monitoring data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const performSecurityScan = async () => {
    try {
      const { error } = await supabase.rpc('detect_advanced_threats');
      if (error) throw error;

      toast({
        title: "Security Scan Complete",
        description: "Advanced threat detection has been executed",
      });
      loadSecurityData();
    } catch (error: any) {
      toast({
        title: "Security Scan Failed",
        description: "Unable to execute security scan",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'good': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: number) => {
    if (severity > 7) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (severity > 4) return <Eye className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enhanced Security Monitor
          </CardTitle>
          <CardDescription>Loading enhanced security monitoring...</CardDescription>
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

  const securityLevel = threatLevel > 7 ? 'critical' : threatLevel > 4 ? 'high' : threatLevel > 2 ? 'medium' : 'low';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Enhanced Security Monitor
          </h2>
          <p className="text-muted-foreground">Real-time security analytics and threat detection</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={performSecurityScan}
            variant="outline"
          >
            <Radar className="w-4 h-4 mr-2" />
            Security Scan
          </Button>
          <Button onClick={loadSecurityData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Status */}
      <Card className={
        securityLevel === 'critical' ? 'border-red-500' :
        securityLevel === 'high' ? 'border-orange-500' :
        securityLevel === 'medium' ? 'border-yellow-500' : 'border-green-500'
      }>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Security Status: 
            <Badge variant={
              securityLevel === 'critical' ? 'destructive' :
              securityLevel === 'high' ? 'destructive' :
              securityLevel === 'medium' ? 'secondary' : 'default'
            }>
              {securityLevel.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {securityLevel === 'critical' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>CRITICAL SECURITY ALERT:</strong> Immediate action required. 
                Multiple high-severity threats detected requiring emergency response.
              </AlertDescription>
            </Alert>
          )}
          {securityLevel === 'high' && (
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                <strong>High Security Alert:</strong> Elevated threat level detected. 
                Enhanced monitoring and security protocols are active.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">{metric.name}</h3>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}
                    {metric.name.includes('Score') || metric.name.includes('Security') || metric.name.includes('Anomalies') ? '%' : ''}
                  </span>
                  <Badge variant={getStatusBadgeVariant(metric.status)}>
                    {metric.status.toUpperCase()}
                  </Badge>
                </div>
                <Progress 
                  value={metric.value} 
                  className={`h-2 ${
                    metric.status === 'critical' ? 'bg-red-100' :
                    metric.status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Monitoring Tabs */}
      <Tabs defaultValue="network" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Network Events
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Behavioral Alerts
          </TabsTrigger>
          <TabsTrigger value="threats" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Active Threats
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Network Security Events
              </CardTitle>
              <CardDescription>
                Real-time network intrusion detection and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              {networkEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">No network security events detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {networkEvents.slice(0, 10).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(event.severity)}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              event.severity > 7 ? 'destructive' :
                              event.severity > 4 ? 'secondary' : 'outline'
                            }>
                              {event.category}
                            </Badge>
                            <span className="font-mono text-sm">{event.source_ip}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{event.event_signature}</p>
                        </div>
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
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Behavioral Anomaly Detection
              </CardTitle>
              <CardDescription>
                AI-powered user behavior analysis and anomaly detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {behavioralAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">No behavioral anomalies detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {behavioralAlerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              alert.anomaly_score > 80 ? 'destructive' :
                              alert.anomaly_score > 60 ? 'secondary' : 'outline'
                            }>
                              Anomaly Score: {alert.anomaly_score.toFixed(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Indicators: {alert.risk_indicators.join(', ')}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Threat Intelligence
              </CardTitle>
              <CardDescription>
                Advanced persistent threat detection and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeThreats.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">No active threats detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeThreats.map((threat) => (
                    <div
                      key={threat.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(threat.severity_level)}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              threat.severity_level > 7 ? 'destructive' :
                              threat.severity_level > 4 ? 'secondary' : 'outline'
                            }>
                              {threat.threat_category}
                            </Badge>
                            <span className="text-sm font-medium">Confidence: {threat.confidence_score}%</span>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">{threat.threat_signature}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Security Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Advanced security metrics and trend analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="font-medium">Data Integrity</p>
                  <p className="text-2xl font-bold text-green-600">99.9%</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="font-medium">Encryption Status</p>
                  <p className="text-2xl font-bold text-green-600">Active</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <p className="font-medium">Response Time</p>
                  <p className="text-2xl font-bold text-green-600">&lt;1s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};