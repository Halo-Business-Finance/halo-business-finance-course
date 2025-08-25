import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Shield } from 'lucide-react';

interface SecurePIIDisplayProps {
  value: string | null;
  type: 'email' | 'phone' | 'name';
  isMasked?: boolean;
  showMaskingIndicator?: boolean;
}

export const SecurePIIDisplay: React.FC<SecurePIIDisplayProps> = ({ 
  value, 
  type, 
  isMasked = false,
  showMaskingIndicator = true 
}) => {
  if (!value) {
    return <span className="text-muted-foreground">Not provided</span>;
  }

  const isMaskedData = value.includes('***') || value.includes('XXX');

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">{value}</span>
      {showMaskingIndicator && isMaskedData && (
        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
          <Shield className="h-3 w-3" />
          Masked
        </Badge>
      )}
    </div>
  );
};