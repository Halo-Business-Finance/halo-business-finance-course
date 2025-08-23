// Secure logging utility for production use
// Replaces console.* statements with secure, structured logging

type LogLevel = 'info' | 'warn' | 'error' | 'debug';
type LogContext = {
  component?: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
  error?: string;
  processingTime?: number;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fieldCount?: number;
  [key: string]: any; // Allow additional properties
};

class SecureLogger {
  private isDevelopment = import.meta.env.DEV;
  
  private logToSupabase(level: LogLevel, message: string, context?: LogContext) {
    // Only log errors and critical events to Supabase in production
    if (!this.isDevelopment && (level === 'error' || context?.action === 'security_event')) {
      // In a real implementation, we would send this to Supabase
      // For now, we'll suppress all production logging
      return;
    }
  }

  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context);
    }
    this.logToSupabase('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    }
    this.logToSupabase('warn', message, context);
  }

  error(message: string, error?: any, context?: LogContext) {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context);
    }
    this.logToSupabase('error', message, { ...context, error: error?.message });
  }

  debug(message: string, data?: any, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data, context);
    }
  }

  // Security-specific logging
  security(event: string, details: Record<string, any>) {
    const message = `Security Event: ${event}`;
    const context = { action: 'security_event', metadata: details };
    
    if (this.isDevelopment) {
      console.warn(`[SECURITY] ${message}`, details);
    }
    this.logToSupabase('error', message, context);
  }
}

export const logger = new SecureLogger();

// Legacy compatibility - these will be no-ops in production
export const cleanConsole = {
  log: (message: string, ...args: any[]) => logger.debug(message, args),
  warn: (message: string, ...args: any[]) => logger.warn(message),
  error: (message: string, error?: any) => logger.error(message, error),
  debug: (message: string, ...args: any[]) => logger.debug(message, args)
};