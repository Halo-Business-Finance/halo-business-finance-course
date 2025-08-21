import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export const useSecureErrorHandling = () => {
  const { toast } = useToast();
  const [isLogging, setIsLogging] = useState(false);

  const handleSecureError = useCallback(async (
    error: Error | string,
    context: ErrorContext = {},
    showToUser: boolean = true
  ) => {
    if (isLogging) return; // Prevent recursive error logging
    
    setIsLogging(true);
    
    try {
      const errorMessage = typeof error === 'string' ? error : error.message;
      
      // Use secure error sanitization function
      const { data: sanitizedResponse } = await supabase.rpc('sanitize_error_response', {
        p_error_message: errorMessage,
        p_user_context: {
          component: context.component,
          action: context.action,
          metadata: context.metadata
        }
      });

      // Log security event for monitoring
      await supabase.rpc('log_critical_security_event', {
        event_name: 'application_error_handled',
        severity_level: 'medium',
        event_details: {
          component: context.component || 'unknown',
          action: context.action || 'unknown',
          error_type: typeof error === 'string' ? 'string_error' : 'exception',
          user_id: context.userId,
          metadata: context.metadata,
          sanitized: true
        }
      });

      // Show user-friendly error message
      if (showToUser && sanitizedResponse) {
        const errorMessage = typeof sanitizedResponse === 'object' && sanitizedResponse !== null && 'error' in sanitizedResponse
          ? (sanitizedResponse as any).error
          : "An unexpected error occurred";
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }

      return sanitizedResponse;
    } catch (loggingError) {
      // Fallback for critical error logging failures
      if (showToUser) {
        toast({
          title: "Error",
          description: "A system error occurred. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLogging(false);
    }
  }, [toast, isLogging]);

  const handleSecurityViolation = useCallback(async (
    violation: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high',
    context: ErrorContext = {}
  ) => {
    try {
      // Log security violation
      await supabase.rpc('log_critical_security_event', {
        event_name: 'security_violation_detected',
        severity_level: severity,
        event_details: {
          violation_type: violation,
          component: context.component || 'unknown',
          action: context.action || 'unknown',
          user_id: context.userId,
          metadata: context.metadata,
          requires_investigation: severity === 'critical'
        }
      });

      // Show appropriate user message based on severity
      if (severity === 'critical') {
        toast({
          title: "Security Alert",
          description: "A security violation has been detected. Your session may be terminated.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Silent fallback for security logging failures
    }
  }, [toast]);

  return {
    handleSecureError,
    handleSecurityViolation,
    isLogging
  };
};