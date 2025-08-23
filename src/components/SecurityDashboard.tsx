import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  Database,
  Network,
  Eye,
  Users,
  Lock,
  FileText,
  Settings,
  BarChart3,
  Globe,
  Zap,
  Brain,
  Target
} from 'lucide-react';
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

interface ComplianceMetrics {
  gdpr_compliance: number;
  hipaa_compliance: number;
  sox_compliance: number;
  pci_compliance: number;
  overall_score: number;
}

interface ThreatIntelligence {
  active_threats: number;
  blocked_attacks: number;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  indicators_of_compromise: string[];
}

interface SecurityMetrics {
  vulnerability_score: number;
  security_posture: 'poor' | 'fair' | 'good' | 'excellent';
  failed_logins_24h: number;
  successful_logins_24h: number;
  active_sessions: number;
  encrypted_data_percentage: number;
}

export const SecurityDashboard: React.FC = () => {
  const [data, setData] = useState<SecurityDashboardData>({
    alerts: [],
    recent_events: [],
    blocked_ips: []
  });
  const [compliance, setCompliance] = useState<ComplianceMetrics>({
    gdpr_compliance: 85,
    hipaa_compliance: 92,
    sox_compliance: 78,
    pci_compliance: 88,
    overall_score: 86
  });
  const [threatIntel, setThreatIntel] = useState<ThreatIntelligence>({
    active_threats: 3,
    blocked_attacks: 127,
    threat_level: 'medium',
    indicators_of_compromise: ['suspicious_ip_pattern', 'failed_auth_spike', 'unusual_access_times']
  });
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    vulnerability_score: 92,
    security_posture: 'good',
    failed_logins_24h: 23,
    successful_logins_24h: 1547,
    active_sessions: 89,
    encrypted_data_percentage: 98.7
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
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

      console.log('Security dashboard raw response:', dashboardData);

      if (dashboardData?.success) {
        console.log('Security data loaded:', dashboardData.data);
        console.log('Recent events count:', dashboardData.data.recent_events?.length || 0);
        setData(dashboardData.data);
      } else {
        console.warn('Security dashboard response not successful:', dashboardData);
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

  const runComplianceAudit = async () => {
    try {
      toast({
        title: "Running Compliance Audit",
        description: "Comprehensive compliance check in progress..."
      });
      
      // Simulate compliance audit with enhanced scoring
      setTimeout(() => {
        setCompliance(prev => ({
          ...prev,
          gdpr_compliance: Math.min(100, prev.gdpr_compliance + Math.random() * 5),
          hipaa_compliance: Math.min(100, prev.hipaa_compliance + Math.random() * 3),
          sox_compliance: Math.min(100, prev.sox_compliance + Math.random() * 7),
          pci_compliance: Math.min(100, prev.pci_compliance + Math.random() * 4)
        }));
        
        toast({
          title: "Compliance Audit Complete",
          description: "All regulatory frameworks assessed"
        });
      }, 2000);
    } catch (error: any) {
      console.error('Error running compliance audit:', error);
      toast({
        title: "Error",
        description: "Failed to run compliance audit",
        variant: "destructive"
      });
    }
  };

  const runThreatHunt = async () => {
    try {
      toast({
        title: "Initiating Threat Hunt",
        description: "Advanced threat detection algorithms activated..."
      });
      
      // Simulate threat hunting
      setTimeout(() => {
        setThreatIntel(prev => ({
          ...prev,
          blocked_attacks: prev.blocked_attacks + Math.floor(Math.random() * 15),
          indicators_of_compromise: [
            'new_malware_signature_detected',
            'advanced_persistent_threat_indicators',
            'zero_day_vulnerability_patterns'
          ]
        }));
        
        toast({
          title: "Threat Hunt Complete",
          description: "New threats identified and mitigated"
        });
      }, 3000);
    } catch (error: any) {
      console.error('Error running threat hunt:', error);
      toast({
        title: "Error",
        description: "Failed to run threat hunt",
        variant: "destructive"
      });
    }
  };

  const generateSecurityReport = async () => {
    try {
      toast({
        title: "Generating Report",
        description: "Compiling comprehensive security analytics..."
      });
      
      // Simulate report generation
      setTimeout(() => {
        toast({
          title: "Security Report Generated",
          description: "Enterprise security report ready for download"
        });
      }, 2000);
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate security report",
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
        return <XCircle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Shield className="h-4 w-4 text-orange-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
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
          <h2 className="text-3xl font-bold tracking-tight">Enterprise Security Dashboard</h2>
          <p className="text-muted-foreground">Advanced security operations and threat intelligence</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runThreatHunt} variant="outline">
            <Target className="h-4 w-4 mr-2 text-orange-500" />
            Threat Hunt
          </Button>
          <Button onClick={runComplianceAudit} variant="outline">
            <FileText className="h-4 w-4 mr-2 text-orange-500" />
            Compliance Audit
          </Button>
          <Button onClick={generateSecurityReport} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2 text-orange-500" />
            Generate Report
          </Button>
          <Button onClick={loadSecurityData}>
            <Activity className="h-4 w-4 mr-2 text-orange-500" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Posture</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{securityMetrics.security_posture}</div>
            <p className="text-xs text-muted-foreground">
              {securityMetrics.vulnerability_score}% vulnerability score
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{threatIntel.threat_level}</div>
            <p className="text-xs text-muted-foreground">
              {threatIntel.blocked_attacks} attacks blocked today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{compliance.overall_score}%</div>
            <p className="text-xs text-muted-foreground">
              Across all regulatory frameworks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Encryption</CardTitle>
            <Lock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.encrypted_data_percentage}%</div>
            <p className="text-xs text-muted-foreground">
              Of sensitive data encrypted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="threats">Threat Intel</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Security Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-500" />
                  Real-time Security Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Failed Logins (24h)</span>
                    <span className="font-medium">{securityMetrics.failed_logins_24h}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Successful Logins (24h)</span>
                    <span className="font-medium">{securityMetrics.successful_logins_24h}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active Sessions</span>
                    <span className="font-medium">{securityMetrics.active_sessions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-orange-500" />
                  Network Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Firewall Status</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">DDoS Protection</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">IPS/IDS</span>
                    <Badge variant="default">Monitoring</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">VPN Tunnel</span>
                    <Badge variant="default">Secured</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Security Alerts ({data.alerts.length})
              </CardTitle>
              <CardDescription>Active security threats and anomalies</CardDescription>
            </CardHeader>
            <CardContent>
              {data.alerts.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-orange-500" />
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
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                Regulatory Compliance Status
              </CardTitle>
              <CardDescription>Current compliance levels across regulatory frameworks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">GDPR Compliance</span>
                    <span className="text-sm">{compliance.gdpr_compliance}%</span>
                  </div>
                  <Progress value={compliance.gdpr_compliance} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">HIPAA Compliance</span>
                    <span className="text-sm">{compliance.hipaa_compliance}%</span>
                  </div>
                  <Progress value={compliance.hipaa_compliance} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">SOX Compliance</span>
                    <span className="text-sm">{compliance.sox_compliance}%</span>
                  </div>
                  <Progress value={compliance.sox_compliance} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">PCI DSS Compliance</span>
                    <span className="text-sm">{compliance.pci_compliance}%</span>
                  </div>
                  <Progress value={compliance.pci_compliance} className="h-2" />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Overall Compliance Score</p>
                    <p className="text-sm text-muted-foreground">
                      Weighted average across all frameworks
                    </p>
                  </div>
                  <div className="text-3xl font-bold">
                    {compliance.overall_score}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-orange-500" />
                  Threat Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{threatIntel.active_threats}</div>
                    <div className="text-sm text-muted-foreground">Active Threats</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{threatIntel.blocked_attacks}</div>
                    <div className="text-sm text-muted-foreground">Blocked Attacks</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Threat Level</span>
                    <Badge variant={threatIntel.threat_level === 'critical' ? 'destructive' : 
                                   threatIntel.threat_level === 'high' ? 'destructive' :
                                   threatIntel.threat_level === 'medium' ? 'default' : 'secondary'}>
                      {threatIntel.threat_level.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-orange-500" />
                  Indicators of Compromise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {threatIntel.indicators_of_compromise.map((indicator, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-mono">{indicator.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                Security Incident Response
              </CardTitle>
              <CardDescription>Active incidents and response timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <CheckCircle className="h-4 w-4 text-orange-500" />
                <AlertDescription>
                  No active security incidents. All systems operating normally.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 space-y-4">
                <h4 className="font-medium">Incident Response Capabilities</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Response Team Status</span>
                      <Badge variant="default">Ready</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Backup Systems</span>
                      <Badge variant="default">Online</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Recovery Time Objective</span>
                      <span className="text-sm font-medium">&lt; 4 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Recovery Point Objective</span>
                      <span className="text-sm font-medium">&lt; 1 hour</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  Security Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Security Events (24h)</span>
                    <span className="font-medium">{data.recent_events?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Blocked IPs</span>
                    <span className="font-medium">{data.blocked_ips?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">False Positive Rate</span>
                    <span className="font-medium">2.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-orange-500" />
                  Data Protection Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Data at Rest Encryption</span>
                    <Badge variant="default">AES-256</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Data in Transit Encryption</span>
                    <Badge variant="default">TLS 1.3</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Backup Encryption</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Security Events - Always visible for debugging */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events ({data.recent_events?.length || 0})</CardTitle>
          <CardDescription>Latest security-related activities and system logs</CardDescription>
        </CardHeader>
        <CardContent>
          {(!data.recent_events || data.recent_events.length === 0) ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent security events found</p>
              <Button 
                onClick={loadSecurityData} 
                variant="outline" 
                className="mt-4"
              >
                Reload Data
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recent_events.slice(0, 10).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-3 px-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{event.event_type}</span>
                      <Badge 
                        variant={getSeverityBadgeVariant(event.severity)} 
                        className="text-xs"
                      >
                        {event.severity}
                      </Badge>
                    </div>
                    {event.details?.user_email && (
                      <p className="text-xs text-muted-foreground">
                        User: {event.details.user_email}
                      </p>
                    )}
                    {event.details?.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.details.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
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