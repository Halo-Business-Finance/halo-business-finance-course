// Secure client-side logging utility
// Replaces console.* statements with production-safe logging

type LogLevel = 'info' | 'warn' | 'error' | 'debug';
type LogContext = {
  component?: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
  error?: string;
  [key: string]: any;
};

class SecureClientLogger {
  private isDevelopment = import.meta.env.DEV;
  
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context);
    }
    // In production, we suppress client-side logs for security
  }

  warn(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    }
    // Critical warnings still logged in production for debugging
    if (!this.isDevelopment && context?.critical) {
      console.warn(`[WARN] ${message}`);
    }
  }

  error(message: string, error?: any, context?: LogContext) {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context);
    } else {
      // Only log critical errors in production without sensitive data
      console.error(`[ERROR] ${message}`);
    }
  }

  debug(message: string, data?: any, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data, context);
    }
    // Debug logs never shown in production
  }

  // Security-specific logging - always logged
  security(event: string, details: Record<string, any>) {
    const message = `Security Event: ${event}`;
    
    if (this.isDevelopment) {
      console.warn(`[SECURITY] ${message}`, details);
    } else {
      // Production security logs with minimal details
      console.warn(`[SECURITY] ${event}`);
    }
  }
}

export const logger = new SecureClientLogger();

// Legacy compatibility exports
export const secureLog = logger.info.bind(logger);
export const secureWarn = logger.warn.bind(logger);
export const secureError = logger.error.bind(logger);
export const secureDebug = logger.debug.bind(logger);