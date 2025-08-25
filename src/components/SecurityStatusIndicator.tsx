import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';

export const SecurityStatusIndicator = () => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <ShieldCheck className="h-5 w-5" />
          Enhanced PII Protection Active
        </CardTitle>
        <CardDescription className="text-green-700">
          Customer personal information is now protected with advanced security measures
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
            <EyeOff className="h-4 w-4 text-blue-600" />
            <div>
              <div className="font-medium text-sm">Data Masking</div>
              <div className="text-xs text-muted-foreground">PII fields masked for non-super admins</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
            <Eye className="h-4 w-4 text-orange-600" />
            <div>
              <div className="font-medium text-sm">Enhanced Logging</div>
              <div className="text-xs text-muted-foreground">Detailed audit trails for all access</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
            <Lock className="h-4 w-4 text-purple-600" />
            <div>
              <div className="font-medium text-sm">Access Control</div>
              <div className="text-xs text-muted-foreground">Strict role-based permissions</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-green-700">
          <Shield className="h-4 w-4" />
          <span>This addresses the security concern about potential customer data theft by hackers</span>
        </div>
      </CardContent>
    </Card>
  );
};