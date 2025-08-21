import { useSecureErrorHandling } from '@/hooks/useSecureErrorHandling';

interface SecurityLoggerProps {
  component: string;
}

export const useProductionSecurityLogger = (component: string) => {
  const { handleSecureError } = useSecureErrorHandling();

  const secureLog = (level: 'info' | 'warn' | 'error', message: string, metadata?: any) => {
    // In production, only log security-relevant information through secure channels
    if (level === 'error') {
      handleSecureError(message, { component, metadata }, false);
    }
    // Development logging is handled by the secure error handler
  };

  const secureError = (error: Error | string, context?: any) => {
    handleSecureError(error, { component, ...context }, true);
  };

  const secureWarn = (message: string, context?: any) => {
    // Log warnings as low-severity security events
    handleSecureError(message, { component, level: 'warning', ...context }, false);
  };

  return {
    secureLog,
    secureError,
    secureWarn,
  };
};