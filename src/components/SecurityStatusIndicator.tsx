import React from 'react';
import { Shield, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react';

interface SecurityStatusIndicatorProps {
  level: 'secure' | 'masked' | 'protected' | 'warning';
  message?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SecurityStatusIndicator: React.FC<SecurityStatusIndicatorProps> = ({
  level,
  message,
  showIcon = true,
  size = 'md'
}) => {
  const getStatusConfig = () => {
    switch (level) {
      case 'secure':
        return {
          icon: Shield,
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          defaultMessage: 'Secure Access'
        };
      case 'masked':
        return {
          icon: EyeOff,
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          defaultMessage: 'Data Masked'
        };
      case 'protected':
        return {
          icon: Lock,
          variant: 'outline' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          defaultMessage: 'Protected Access'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          defaultMessage: 'Security Alert'
        };
      default:
        return {
          icon: Shield,
          variant: 'default' as const,
          className: '',
          defaultMessage: 'Unknown Status'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <div className={`${config.className} ${textSize} flex items-center gap-1 px-2.5 py-0.5 rounded-full`}>
      {showIcon && <Icon className={iconSize} />}
      {displayMessage}
    </div>
  );
};