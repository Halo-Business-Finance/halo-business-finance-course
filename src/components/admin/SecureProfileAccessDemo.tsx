import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useSecureProfileAccess } from '@/hooks/useSecureProfileAccess';
import { SecurePIIDisplay } from '@/components/SecurePIIDisplay';
import { SecurityStatusIndicator } from '@/components/SecurityStatusIndicator';

export const SecureProfileAccessDemo: React.FC = () => {
  const { 
    profiles, 
    loading, 
    error, 
    refreshProfiles, 
    accessLevel, 
    userRole 
  } = useSecureProfileAccess();

  const getAccessLevelInfo = () => {
    switch (accessLevel) {
      case 'full':
        return {
          badge: <SecurityStatusIndicator level="secure" message="Full Access" />,
          description: "You have full access to customer data with comprehensive audit logging."
        };
      case 'masked':
        return {
          badge: <SecurityStatusIndicator level="masked" message="Masked Access" />,
          description: "Customer data is masked for privacy protection. All access is logged."
        };
      case 'none':
        return {
          badge: <SecurityStatusIndicator level="protected" message="No Access" />,
          description: "You don't have permission to access customer data."
        };
      default:
        return {
          badge: <SecurityStatusIndicator level="warning" message="Unknown" />,
          description: "Access level could not be determined."
        };
    }
  };

  const accessInfo = getAccessLevelInfo();

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Secure Customer Data Access
              </CardTitle>
              <CardDescription>
                Enhanced security features demonstration
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {accessInfo.badge}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Features Active:</strong> {accessInfo.description}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">Customer Profiles</span>
              </div>
              <div className="text-2xl font-bold">{profiles.length}</div>
              <div className="text-sm text-muted-foreground">
                {accessLevel === 'masked' ? 'Masked for privacy' : 'Available profiles'}
              </div>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Your Role</span>
              </div>
              <div className="text-lg font-bold capitalize">{userRole || 'Unknown'}</div>
              <div className="text-sm text-muted-foreground">Current access level</div>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="font-medium">Security Status</span>
              </div>
              <div className="text-lg font-bold text-green-600">Protected</div>
              <div className="text-sm text-muted-foreground">All access logged</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Data is automatically masked based on your role and permissions.
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshProfiles}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Profiles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Profiles</CardTitle>
          <CardDescription>
            Demonstrating secure data access with role-based masking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading customer data...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Access Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {!loading && !error && profiles.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                No customer profiles are accessible with your current permissions.
              </p>
            </div>
          )}

          {!loading && !error && profiles.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Company</th>
                    <th className="text-left p-2">Joined</th>
                    <th className="text-left p-2">Data Status</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr key={profile.user_id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <SecurePIIDisplay 
                          value={profile.name} 
                          type="name" 
                          isMasked={profile.is_masked}
                          userRole={userRole || 'user'}
                        />
                      </td>
                      <td className="p-2">
                        <SecurePIIDisplay 
                          value={profile.email} 
                          type="email" 
                          isMasked={profile.is_masked}
                          userRole={userRole || 'user'}
                        />
                      </td>
                      <td className="p-2">
                        <SecurePIIDisplay 
                          value={profile.phone} 
                          type="phone" 
                          isMasked={profile.is_masked}
                          userRole={userRole || 'user'}
                        />
                      </td>
                      <td className="p-2">
                        <SecurePIIDisplay 
                          value={profile.company} 
                          type="company" 
                          isMasked={profile.is_masked}
                          userRole={userRole || 'user'}
                        />
                      </td>
                      <td className="p-2">
                        <span className="text-sm">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-2">
                        <SecurityStatusIndicator 
                          level={profile.is_masked ? 'masked' : 'secure'}
                          message={profile.is_masked ? 'Protected' : 'Full Access'}
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Implementation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Data Protection Features</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Role-based data masking</li>
                  <li>• Comprehensive audit logging</li>
                  <li>• Real-time security monitoring</li>
                  <li>• Automatic breach detection</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Compliance Features</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• GDPR compliance ready</li>
                  <li>• Data access justification</li>
                  <li>• Retention period management</li>
                  <li>• Privacy impact assessments</li>
                </ul>
              </div>
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Note:</strong> All customer data access is logged, monitored, and subject to 
                privacy regulations. Only access data when necessary for legitimate business purposes.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};