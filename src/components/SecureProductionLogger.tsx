import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export const useSecureProductionLogger = (component: string) => {
  const secureLog = useCallback(async (
    level: 'info' | 'warn' | 'error',
    message: string,
    context: LogContext = {}
  ) => {
    // Only log security-relevant events through secure channels
    if (process.env.NODE_ENV === 'production') {
      try {
        await supabase.rpc('log_critical_security_event', {
          event_name: `production_${level}_${component}`,
          severity_level: context.severity || (level === 'error' ? 'high' : 'low'),
          event_details: {
            component,
            level,
            message: 'Application event occurred', // Sanitized message
            context: {
              action: context.action,
              metadata: context.metadata ? Object.keys(context.metadata).length : 0,
              timestamp: new Date().toISOString()
            }
          }
        });
      } catch (error) {
        // Silent fallback - no console logging in production
      }
    }
  }, [component]);

  const secureError = useCallback(async (
    error: Error | string,
    context: LogContext = {}
  ) => {
    try {
      await supabase.rpc('sanitize_error_response', {
        p_error_message: typeof error === 'string' ? error : error.message,
        p_user_context: {
          component,
          action: context.action,
          metadata: context.metadata
        }
      });
    } catch (sanitizeError) {
      // Silent fallback for error sanitization failures
    }
  }, [component]);

  const secureWarn = useCallback(async (
    message: string,
    context: LogContext = {}
  ) => {
    await secureLog('warn', message, { ...context, severity: 'medium' });
  }, [secureLog]);

  const secureInfo = useCallback(async (
    message: string,
    context: LogContext = {}
  ) => {
    await secureLog('info', message, { ...context, severity: 'low' });
  }, [secureLog]);

  return {
    secureLog,
    secureError,
    secureWarn,
    secureInfo,
  };
};

// Production-safe replacement for console methods
export const productionSafeConsole = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(...args);
    }
  }
};