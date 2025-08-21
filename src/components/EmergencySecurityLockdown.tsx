import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Shield, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';

export const EmergencySecurityLockdown: React.FC = () => {
  const { toast } = useToast();
  const { isSuperAdmin, isLoading: roleLoading } = useAdminRole();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [executing, setExecuting] = useState(false);

  const triggerEmergencyLockdown = async () => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the emergency lockdown",
        variant: "destructive",
      });
      return;
    }

    setExecuting(true);
    
    try {
      const { data, error } = await supabase.rpc('trigger_emergency_security_lockdown', {
        p_reason: reason,
        p_target_user_id: targetUserId || null
      });

      if (error) {
        const { data: sanitizedError } = await supabase.rpc('sanitize_error_response', {
          p_error_message: error.message,
          p_user_context: { action: 'emergency_lockdown', component: 'EmergencySecurityLockdown' }
        });
        throw new Error((sanitizedError as any)?.error || 'Failed to trigger emergency lockdown');
      }

      toast({
        title: "Emergency Lockdown Activated", 
        description: `Lockdown ID: ${(data as any)?.lockdown_id}. Sessions affected: ${(data as any)?.affected_sessions}`,
        variant: "destructive",
      });

      setIsOpen(false);
      setReason('');
      setTargetUserId('');
    } catch (error) {
      await supabase.rpc('log_critical_security_event', {
        event_name: 'emergency_lockdown_error',
        severity_level: 'critical',
        event_details: {
          error_type: 'lockdown_execution_failure',
          reason: reason,
          target_user_id: targetUserId || null
        }
      });

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to trigger emergency lockdown",
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };

  if (roleLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading emergency controls...</div>
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
          <CardDescription>
            Super Admin privileges required for emergency security controls.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Emergency Security Lockdown
        </CardTitle>
        <CardDescription>
          Critical security response system for immediate threat containment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-destructive font-medium mb-2">
            <Lock className="h-4 w-4" />
            CRITICAL SECURITY FUNCTION
          </div>
          <p className="text-sm text-muted-foreground">
            This will immediately terminate user sessions and create critical security alerts. 
            Use only for confirmed security breaches or imminent threats.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Initiate Emergency Lockdown
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive">Emergency Security Lockdown</DialogTitle>
              <DialogDescription>
                Provide details for the emergency security response. This action will be logged and audited.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Lockdown *</Label>
                <Textarea
                  id="reason"
                  placeholder="Describe the security threat or breach requiring immediate lockdown..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetUser">Target User ID (Optional)</Label>
                <Input
                  id="targetUser"
                  placeholder="Leave empty to affect all sessions"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Specify a user ID to target specific user, or leave empty for system-wide lockdown
                </p>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={executing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={triggerEmergencyLockdown}
                disabled={executing || !reason.trim()}
              >
                {executing ? 'Executing Lockdown...' : 'Confirm Emergency Lockdown'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};