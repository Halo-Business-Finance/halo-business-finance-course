import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SecurityStatusIndicatorProps {
  isDataMasked?: boolean;
  userRole?: string;
  showDetails?: boolean;
  level?: 'secure' | 'protected' | 'masked' | 'warning';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SecurityStatusIndicator: React.FC<SecurityStatusIndicatorProps> = ({ 
  isDataMasked = false, 
  userRole = 'user',
  showDetails = true 
}) => {
  const getSecurityLevel = () => {
    if (userRole === 'super_admin') {
      return {
        level: 'Full Access',
        color: 'destructive',
        icon: AlertTriangle,
        description: 'Viewing unmasked customer data'
      };
    } else if (userRole === 'admin') {
      return {
        level: 'Protected Access',
        color: 'secondary',
        icon: Eye,
        description: 'Customer data is masked for protection'
      };
    } else {
      return {
        level: 'Standard Access',
        color: 'default',
        icon: Lock,
        description: 'Limited data access'
      };
    }
  };

  const security = getSecurityLevel();
  const IconComponent = security.icon;

  if (!showDetails) {
    return (
      <Badge variant={security.color as any} className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        {security.level}
      </Badge>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <IconComponent className="h-4 w-4 text-primary" />
          Security Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground min-w-[80px]">Access Level:</span>
            <Badge variant={security.color as any} className="text-xs">
              {security.level}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground min-w-[80px]">Data Protection:</span>
            <Badge variant={isDataMasked ? "default" : "secondary"} className="text-xs">
              {isDataMasked ? "Masked" : "Unmasked"}
            </Badge>
          </div>
        </div>
        <div className="pt-1 border-t border-border/30">
          <p className="text-xs text-muted-foreground">{security.description}</p>
          {userRole === 'super_admin' && (
            <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 mt-1">
              <AlertTriangle className="h-3 w-3" />
              Enhanced security logging active
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};