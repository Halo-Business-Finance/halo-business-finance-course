import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, AlertTriangle, Activity, Eye, Lock, Zap, 
  RefreshCw, Globe, Clock, UserX, TrendingUp, 
  MapPin, Laptop, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ThreatStats {
  total_threats: number;
  critical_threats: number;
  high_threats: number;
  medium_threats: number;
  auto_blocked: number;
  unique_ips: number;
  failed_logins_24h: number;
  suspicious_patterns: number;
}

interface FailedLogin {
  id: string;
  email: string;
  ip_address: string;
  user_agent: string;
  failure_reason: string;
  created_at: string;
  location?: string;
  attempt_count: number;
}

interface SuspiciousPattern {
  id: string;
  pattern_type: string;
  description: string;
  confidence_score: number;
  affected_users: number;
  detected_at: string;
  status: 'active' | 'investigating' | 'resolved';
  indicators: string[];
}

interface ThreatTrend {
  date: string;
  threats: number;
  blocked: number;
  failed_logins: number;
}

interface GeoThreat {
  country: string;
  city: string;
  threat_count: number;
  blocked_count: number;
}

const SEVERITY_COLORS = {
  critical: 'hsl(var(--destructive))',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
};

export const SecurityMonitoringDashboard = () => {
  const [stats, setStats] = useState<ThreatStats | null>(null);
  const [failedLogins, setFailedLogins] = useState<FailedLogin[]>([]);
  const [suspiciousPatterns, setSuspiciousPatterns] = useState<SuspiciousPattern[]>([]);
  const [threatTrends, setThreatTrends] = useState<ThreatTrend[]>([]);
  const [geoThreats, setGeoThreats] = useState<GeoThreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadSecurityData = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);

      // Load threat statistics
      const [statsResult, eventsResult, anomaliesResult] = await Promise.all([
        supabase.functions.invoke('military-security-monitor', {
          body: { action: 'security_dashboard_data' }
        }),
        supabase.from('security_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase.from('access_anomalies')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      // Process threat stats
      const threatData = statsResult.data;
      
      // Count failed logins from security events
      const failedLoginEvents = eventsResult.data?.filter(
        e => e.event_type === 'login_failure' || e.event_type === 'failed_login'
      ) || [];

      // Count suspicious patterns from anomalies
      const suspiciousCount = anomaliesResult.data?.filter(
        a => a.severity === 'critical' || a.severity === 'high'
      ).length || 0;

      setStats({
        total_threats: threatData?.threat_stats?.total_threats || 0,
        critical_threats: threatData?.threat_stats?.critical_threats || 0,
        high_threats: threatData?.threat_stats?.high_threats || 0,
        medium_threats: threatData?.threat_stats?.medium_threats || 0,
        auto_blocked: threatData?.threat_stats?.auto_blocked || 0,
        unique_ips: threatData?.threat_stats?.unique_ips || 0,
        failed_logins_24h: failedLoginEvents.length,
        suspicious_patterns: suspiciousCount
      });

      // Process failed logins
      const loginAttempts: FailedLogin[] = failedLoginEvents.slice(0, 20).map((event) => {
        const details = event.details as Record<string, any> | null;
        const geolocation = details?.geolocation as Record<string, any> | null;
        return {
          id: event.id,
          email: details?.email || 'Unknown',
          ip_address: details?.ip_address || details?.source_ip || 'Unknown',
          user_agent: details?.user_agent || 'Unknown',
          failure_reason: details?.reason || details?.failure_reason || 'Authentication failed',
          created_at: event.created_at,
          location: details?.location || geolocation?.city,
          attempt_count: details?.attempt_count || 1
        };
      });
      setFailedLogins(loginAttempts);

      // Process suspicious patterns from anomalies
      const patterns: SuspiciousPattern[] = (anomaliesResult.data || []).slice(0, 10).map(anomaly => ({
        id: anomaly.id,
        pattern_type: anomaly.anomaly_type,
        description: getPatternDescription(anomaly.anomaly_type, anomaly.pattern_data),
        confidence_score: anomaly.confidence_score,
        affected_users: 1,
        detected_at: anomaly.created_at,
        status: anomaly.is_resolved ? 'resolved' : 'active',
        indicators: extractIndicators(anomaly)
      }));
      setSuspiciousPatterns(patterns);

      // Generate threat trends (last 7 days)
      const trends = generateThreatTrends(eventsResult.data || [], failedLoginEvents);
      setThreatTrends(trends);

      // Generate geo threats
      const geoData = generateGeoThreats(eventsResult.data || []);
      setGeoThreats(geoData);

      setLastUpdate(new Date());

      if (showRefreshToast) {
        toast({
          title: "Security Data Refreshed",
          description: "Dashboard updated with latest threat intelligence",
        });
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
      toast({
        title: "Error Loading Security Data",
        description: "Some security metrics may be unavailable",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSecurityData();
    
    // Set up real-time subscription for security events
    const channel = supabase
      .channel('security-monitoring')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'security_events'
      }, (payload) => {
        if (isMonitoring) {
          const event = payload.new as any;
          if (event.severity === 'critical' || event.severity === 'high') {
            toast({
              title: "Security Alert",
              description: `${event.event_type}: ${event.severity} severity detected`,
              variant: "destructive"
            });
          }
          loadSecurityData();
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'access_anomalies'
      }, (payload) => {
        if (isMonitoring) {
          toast({
            title: "Anomaly Detected",
            description: "New suspicious activity pattern identified",
            variant: "destructive"
          });
          loadSecurityData();
        }
      })
      .subscribe();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (isMonitoring) {
        loadSecurityData();
      }
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [loadSecurityData, isMonitoring]);

  const getPatternDescription = (type: string, data: any): string => {
    switch (type) {
      case 'impossible_travel':
        return `Login detected from geographically impossible location based on travel time`;
      case 'unusual_time':
        return `Access attempt outside normal working hours for this user`;
      case 'new_device':
        return `Login from unrecognized device or browser`;
      case 'multiple_failures':
        return `Multiple failed authentication attempts detected`;
      case 'credential_stuffing':
        return `Automated credential testing pattern detected`;
      case 'brute_force':
        return `Brute force attack pattern identified`;
      default:
        return `Suspicious ${type.replace(/_/g, ' ')} pattern detected`;
    }
  };

  const extractIndicators = (anomaly: any): string[] => {
    const indicators: string[] = [];
    if (anomaly.location_data) indicators.push('Geographic anomaly');
    if (anomaly.device_data) indicators.push('Device fingerprint mismatch');
    if (anomaly.behavioral_data) indicators.push('Behavioral deviation');
    if (anomaly.confidence_score > 0.8) indicators.push('High confidence');
    return indicators;
  };

  const generateThreatTrends = (events: any[], failedLogins: any[]): ThreatTrend[] => {
    const days = 7;
    const trends: ThreatTrend[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEvents = events.filter(e => 
        e.created_at && e.created_at.startsWith(dateStr)
      );
      
      const dayFailedLogins = failedLogins.filter(e =>
        e.created_at && e.created_at.startsWith(dateStr)
      );

      trends.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        threats: dayEvents.filter(e => e.severity === 'critical' || e.severity === 'high').length,
        blocked: dayEvents.filter(e => e.event_type?.includes('blocked')).length,
        failed_logins: dayFailedLogins.length
      });
    }
    
    return trends;
  };

  const generateGeoThreats = (events: any[]): GeoThreat[] => {
    const geoMap = new Map<string, GeoThreat>();
    
    events.forEach(event => {
      const geo = event.details?.geolocation || event.details?.location_data;
      if (geo) {
        const key = `${geo.country || 'Unknown'}-${geo.city || 'Unknown'}`;
        const existing = geoMap.get(key) || {
          country: geo.country || 'Unknown',
          city: geo.city || 'Unknown',
          threat_count: 0,
          blocked_count: 0
        };
        existing.threat_count++;
        if (event.event_type?.includes('blocked')) {
          existing.blocked_count++;
        }
        geoMap.set(key, existing);
      }
    });

    return Array.from(geoMap.values())
      .sort((a, b) => b.threat_count - a.threat_count)
      .slice(0, 10);
  };

  const handleInvestigatePattern = async (pattern: SuspiciousPattern) => {
    toast({
      title: "Investigation Started",
      description: `Pattern ${pattern.pattern_type} is being investigated`,
    });
    
    setSuspiciousPatterns(prev => 
      prev.map(p => p.id === pattern.id ? { ...p, status: 'investigating' } : p)
    );
  };

  const handleResolvePattern = async (pattern: SuspiciousPattern) => {
    try {
      await supabase
        .from('access_anomalies')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', pattern.id);

      toast({
        title: "Pattern Resolved",
        description: "The suspicious pattern has been marked as resolved",
      });

      setSuspiciousPatterns(prev => 
        prev.map(p => p.id === pattern.id ? { ...p, status: 'resolved' } : p)
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve pattern",
        variant: "destructive"
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    };
    return variants[severity] || 'outline';
  };

  const pieData = [
    { name: 'Critical', value: stats?.critical_threats || 0, color: SEVERITY_COLORS.critical },
    { name: 'High', value: stats?.high_threats || 0, color: SEVERITY_COLORS.high },
    { name: 'Medium', value: stats?.medium_threats || 0, color: SEVERITY_COLORS.medium },
    { name: 'Low', value: (stats?.total_threats || 0) - (stats?.critical_threats || 0) - (stats?.high_threats || 0) - (stats?.medium_threats || 0), color: SEVERITY_COLORS.low },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Loading security intelligence...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Security Monitoring Center
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time threat detection and activity monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated {lastUpdate.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadSecurityData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant={isMonitoring ? "default" : "outline"}
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? <Lock className="h-4 w-4 mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            {isMonitoring ? "Live" : "Paused"}
          </Button>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {stats && stats.critical_threats > 0 && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>CRITICAL:</strong> {stats.critical_threats} critical threat{stats.critical_threats > 1 ? 's' : ''} detected in the last 24 hours
            </span>
            <Button variant="destructive" size="sm">
              View Critical Threats
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <Badge variant="outline" className="text-xs">24h</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{stats?.total_threats || 0}</div>
              <p className="text-xs text-muted-foreground">Total Threats</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-destructive">{stats?.critical_threats || 0}</div>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-orange-500">{stats?.high_threats || 0}</div>
              <p className="text-xs text-muted-foreground">High</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Lock className="h-5 w-5 text-green-600" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-green-600">{stats?.auto_blocked || 0}</div>
              <p className="text-xs text-muted-foreground">Blocked</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <UserX className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-yellow-600">{stats?.failed_logins_24h || 0}</div>
              <p className="text-xs text-muted-foreground">Failed Logins</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-purple-600">{stats?.suspicious_patterns || 0}</div>
              <p className="text-xs text-muted-foreground">Patterns</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-blue-600">{stats?.unique_ips || 0}</div>
              <p className="text-xs text-muted-foreground">Unique IPs</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Activity className="h-5 w-5 text-primary" />
              <div className={`h-2 w-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{isMonitoring ? 'Active' : 'Paused'}</div>
              <p className="text-xs text-muted-foreground">Monitoring</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="failed-logins">Failed Logins</TabsTrigger>
          <TabsTrigger value="patterns">Suspicious Patterns</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Threat Trend Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  7-Day Threat Trend
                </CardTitle>
                <CardDescription>
                  Security events and blocked threats over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={threatTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="threats" 
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={2}
                        name="Threats"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="blocked" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        name="Blocked"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="failed_logins" 
                        stroke="#eab308" 
                        strokeWidth={2}
                        name="Failed Logins"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Severity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Severity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No threats to display
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Failed Logins Tab */}
        <TabsContent value="failed-logins">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Recent Failed Login Attempts
              </CardTitle>
              <CardDescription>
                Authentication failures in the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {failedLogins.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mb-3 text-green-500" />
                    <p>No failed login attempts detected</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {failedLogins.map((login) => (
                      <div 
                        key={login.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-destructive/10">
                            <UserX className="h-4 w-4 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium">{login.email}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Globe className="h-3 w-3" />
                              <span>{login.ip_address}</span>
                              {login.location && (
                                <>
                                  <MapPin className="h-3 w-3 ml-2" />
                                  <span>{login.location}</span>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {login.failure_reason}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {login.attempt_count > 1 && (
                              <Badge variant="destructive" className="mr-2">
                                {login.attempt_count} attempts
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(login.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suspicious Patterns Tab */}
        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Suspicious Activity Patterns
              </CardTitle>
              <CardDescription>
                AI-detected anomalies and behavioral patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {suspiciousPatterns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mb-3 text-green-500" />
                    <p>No suspicious patterns detected</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suspiciousPatterns.map((pattern) => (
                      <div 
                        key={pattern.id} 
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              pattern.status === 'resolved' ? 'bg-green-500/10' : 
                              pattern.status === 'investigating' ? 'bg-yellow-500/10' : 
                              'bg-destructive/10'
                            }`}>
                              {pattern.status === 'resolved' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : pattern.status === 'investigating' ? (
                                <Eye className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium capitalize">
                                  {pattern.pattern_type.replace(/_/g, ' ')}
                                </p>
                                <Badge variant={pattern.status === 'resolved' ? 'secondary' : pattern.status === 'investigating' ? 'default' : 'destructive'}>
                                  {pattern.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {pattern.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {pattern.indicators.map((indicator, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {indicator}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Confidence: {Math.round(pattern.confidence_score * 100)}% • 
                                Detected: {new Date(pattern.detected_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {pattern.status !== 'resolved' && (
                            <div className="flex gap-2">
                              {pattern.status !== 'investigating' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleInvestigatePattern(pattern)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Investigate
                                </Button>
                              )}
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleResolvePattern(pattern)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Resolve
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Geographic Threat Distribution
              </CardTitle>
              <CardDescription>
                Threats by location
              </CardDescription>
            </CardHeader>
            <CardContent>
              {geoThreats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mb-3" />
                  <p>No geographic data available</p>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={geoThreats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="city" 
                        type="category" 
                        width={100}
                        className="text-xs"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="threat_count" fill="hsl(var(--destructive))" name="Threats" />
                      <Bar dataKey="blocked_count" fill="#22c55e" name="Blocked" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
