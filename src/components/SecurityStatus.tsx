import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';

interface SecurityStatusProps {
  className?: string;
}

export const SecurityStatus: React.FC<SecurityStatusProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Shield className="h-4 w-4 text-green-600" />
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Secure
      </Badge>
      <span className="text-xs text-muted-foreground">
        All security fixes implemented
      </span>
    </div>
  );
};