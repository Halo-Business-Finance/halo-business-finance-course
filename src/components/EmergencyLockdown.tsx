import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Shield, 
  Zap, 
  Users, 
  Lock, 
  Loader2,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminRole } from '@/hooks/useAdminRole';

interface LockdownStatus {
  active: boolean;
  type: string;
  reason: string;
  timestamp: string;
  affectedUsers: number;
}

export const EmergencyLockdown: React.FC = () => {
  const [reason, setReason] = useState('');
  const [lockdownType, setLockdownType] = useState('full');
  const [affectedUserIds, setAffectedUserIds] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockdownStatus, setLockdownStatus] = useState<LockdownStatus | null>(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  const { isSuperAdmin, isLoading } = useAdminRole();

  const generateConfirmationCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return code;
  };

  const initiateEmergencyLockdown = async () => {
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for the emergency lockdown.",
        variant: "destructive"
      });
      return;
    }

    const confirmCode = generateConfirmationCode();
    setConfirmationCode(confirmCode);
    setShowConfirmation(true);
    
    toast({
      title: "Confirmation Required",
      description: `Enter confirmation code: ${confirmCode}`,
      duration: 10000
    });
  };

  const executeEmergencyLockdown = async (inputCode: string) => {
    if (inputCode !== confirmationCode) {
      toast({
        title: "Invalid Confirmation Code",
        description: "The confirmation code is incorrect.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setShowConfirmation(false);

    try {
      const affectedUsers = affectedUserIds 
        ? affectedUserIds.split(',').map(id => id.trim()).filter(Boolean)
        : null;

      const { data, error } = await supabase.functions.invoke('military-security-engine', {
        body: {
          action: 'emergency_lockdown',
          data: {
            reason: reason.trim(),
            affectedUsers,
            lockdownType
          }
        }
      });

      if (error) throw error;

      const result = data.data;
      
      setLockdownStatus({
        active: true,
        type: lockdownType,
        reason: reason.trim(),
        timestamp: new Date().toISOString(),
        affectedUsers: result.affected_users || 0
      });

      toast({
        title: "EMERGENCY LOCKDOWN ACTIVATED",
        description: `Lockdown initiated successfully. ${result.sessions_terminated} sessions terminated.`,
        variant: "destructive",
        duration: 10000
      });

      // Reset form
      setReason('');
      setAffectedUserIds('');
      setConfirmationCode('');

    } catch (error: any) {
      console.error('Emergency lockdown error:', error);
      toast({
        title: "Lockdown Failed",
        description: error.message || "Failed to initiate emergency lockdown.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verifying security clearance...</p>
        </CardContent>
      </Card>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Emergency lockdown controls require Super Administrator privileges. 
              Contact your system administrator if you need access to these controls.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      {lockdownStatus && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Zap className="h-5 w-5 animate-pulse" />
              EMERGENCY LOCKDOWN ACTIVE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Badge variant="destructive" className="block w-fit mt-1">
                  {lockdownStatus.type.toUpperCase()}
                </Badge>
              </div>
              <div>
                <Label>Affected Users</Label>
                <div className="font-mono text-lg">{lockdownStatus.affectedUsers}</div>
              </div>
              <div className="col-span-2">
                <Label>Reason</Label>
                <div className="text-sm mt-1 p-2 bg-muted rounded">
                  {lockdownStatus.reason}
                </div>
              </div>
              <div className="col-span-2">
                <Label>Initiated</Label>
                <div className="text-sm text-muted-foreground">
                  {new Date(lockdownStatus.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Lockdown Controls */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Emergency Security Lockdown
          </CardTitle>
          <CardDescription>
            ⚠️ CRITICAL SECURITY FUNCTION ⚠️ This will immediately terminate user sessions and restrict access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>WARNING:</strong> Emergency lockdown should only be used in critical security situations. 
              This action will be logged and audited. Misuse may result in disciplinary action.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="lockdown-reason">Lockdown Reason *</Label>
              <Textarea
                id="lockdown-reason"
                placeholder="Describe the security incident or reason for emergency lockdown..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="lockdown-type">Lockdown Type</Label>
              <Select value={lockdownType} onValueChange={setLockdownType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Lockdown (All Systems)</SelectItem>
                  <SelectItem value="session_termination">Session Termination Only</SelectItem>
                  <SelectItem value="partial">Partial Lockdown (Specific Users)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {lockdownType === 'partial' && (
              <div>
                <Label htmlFor="affected-users">Affected User IDs</Label>
                <Input
                  id="affected-users"
                  placeholder="Enter user IDs separated by commas..."
                  value={affectedUserIds}
                  onChange={(e) => setAffectedUserIds(e.target.value)}
                  className="mt-1"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Leave empty for system-wide lockdown
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={initiateEmergencyLockdown}
                disabled={loading || !reason.trim()}
                variant="destructive"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Executing Lockdown...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Initiate Emergency Lockdown
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmation Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>FINAL WARNING:</strong> You are about to execute an emergency security lockdown. 
                This action cannot be undone and will affect system operations.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4 mt-4">
              <div>
                <Label>Confirmation Code</Label>
                <div className="font-mono text-lg bg-muted p-2 rounded mt-1">
                  {confirmationCode}
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmation-input">Enter Confirmation Code</Label>
                <Input
                  id="confirmation-input"
                  placeholder="Enter the confirmation code above"
                  className="mt-1"
                  onChange={(e) => {
                    if (e.target.value === confirmationCode) {
                      executeEmergencyLockdown(e.target.value);
                    }
                  }}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowConfirmation(false);
                    setConfirmationCode('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => executeEmergencyLockdown(confirmationCode)}
                  variant="destructive"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Execute Lockdown
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lockdown Procedures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Emergency Procedures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Full Lockdown Effects:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                <li>Immediate termination of all active user sessions</li>
                <li>Temporary suspension of new user logins</li>
                <li>Activation of enhanced monitoring and alerting</li>
                <li>Notification of security team and administrators</li>
                <li>Creation of security incident record</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">When to Use Emergency Lockdown:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                <li>Suspected data breach or unauthorized access</li>
                <li>Malware or ransomware detection</li>
                <li>Compromised administrator accounts</li>
                <li>External security threats or attacks</li>
                <li>Compliance or regulatory requirements</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Post-Lockdown Recovery:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                <li>Complete security assessment and threat analysis</li>
                <li>System integrity verification and vulnerability patching</li>
                <li>Gradual restoration of services with enhanced monitoring</li>
                <li>User notification and communication plan</li>
                <li>Incident report and lessons learned documentation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};