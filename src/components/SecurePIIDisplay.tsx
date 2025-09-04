import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { SecurityStatusIndicator } from './SecurityStatusIndicator';

interface SecurePIIDisplayProps {
  value: string | null;
  type: 'email' | 'phone' | 'name' | 'company';
  isMasked?: boolean;
  showMaskingIndicator?: boolean;
  accessLevel?: 'full' | 'masked' | 'restricted';
  userRole?: string;
}

export const SecurePIIDisplay: React.FC<SecurePIIDisplayProps> = ({ 
  value, 
  type, 
  isMasked = false,
  showMaskingIndicator = true,
  accessLevel = 'full',
  userRole = 'user'
}) => {
  if (!value) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Not provided</span>
        {showMaskingIndicator && (
          <SecurityStatusIndicator 
            level="protected" 
            message="No Data"
            size="sm"
          />
        )}
      </div>
    );
  }

  // Detect if data is masked based on patterns
  const isMaskedData = value.includes('***') || value.includes('XXX') || value.includes('PROTECTED') || value.includes('RESTRICTED');
  
  // Determine security level for indicator
  const getSecurityLevel = () => {
    if (value.includes('RESTRICTED')) return 'protected';
    if (isMaskedData) return 'masked';
    if (userRole === 'super_admin') return 'secure';
    return 'warning';
  };

  const getSecurityMessage = () => {
    if (value.includes('RESTRICTED')) return 'Access Denied';
    if (isMaskedData) return 'Data Masked';
    if (userRole === 'super_admin') return 'Full Access';
    return 'Unprotected';
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`font-mono text-sm ${isMaskedData ? 'text-muted-foreground' : ''}`}>
        {value}
      </span>
      {showMaskingIndicator && (
        <SecurityStatusIndicator 
          level={getSecurityLevel()}
          message={getSecurityMessage()}
          size="sm"
        />
      )}
    </div>
  );
};