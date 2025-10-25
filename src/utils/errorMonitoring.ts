/**
 * Production Error Monitoring Utility
 * Captures and logs errors for production debugging
 */

interface ErrorContext {
  userId?: string;
  userEmail?: string;
  route?: string;
  action?: string;
  componentStack?: string;
  [key: string]: any;
}

interface ErrorLog {
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: string;
  environment: string;
  userAgent: string;
  url: string;
}

class ErrorMonitor {
  private isDevelopment = import.meta.env.DEV;
  private errorQueue: ErrorLog[] = [];
  private maxQueueSize = 50;

  constructor() {
    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'),
        { type: 'unhandledRejection', reason: event.reason }
      );
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      this.captureError(
        new Error(event.message),
        { 
          type: 'globalError',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      );
    });
  }

  /**
   * Capture and log an error with context
   */
  captureError(error: Error, context: ErrorContext = {}): void {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        route: window.location.pathname,
      },
      timestamp: new Date().toISOString(),
      environment: this.isDevelopment ? 'development' : 'production',
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In development, log to console
    if (this.isDevelopment) {
      console.error('Error captured:', errorLog);
    }

    // Add to queue
    this.errorQueue.push(errorLog);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // In production, you would send to your error tracking service
    // Example: Sentry, LogRocket, or custom backend
    if (!this.isDevelopment) {
      this.sendToErrorService(errorLog);
    }
  }

  /**
   * Send error to error tracking service
   */
  private async sendToErrorService(errorLog: ErrorLog): Promise<void> {
    try {
      // This is where you'd integrate with your error tracking service
      // For example: Sentry, LogRocket, or a custom backend
      
      // Example with custom backend:
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorLog)
      // });

      // For now, store in localStorage as fallback
      const existingErrors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingErrors.push(errorLog);
      // Keep only last 20 errors
      const recentErrors = existingErrors.slice(-20);
      localStorage.setItem('error_logs', JSON.stringify(recentErrors));
    } catch (e) {
      // Silent fail - don't let error monitoring break the app
    }
  }

  /**
   * Capture a custom message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context: ErrorContext = {}): void {
    if (level === 'error') {
      this.captureError(new Error(message), context);
    } else if (this.isDevelopment) {
      console[level === 'warning' ? 'warn' : 'log'](message, context);
    }
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(): ErrorLog[] {
    return [...this.errorQueue];
  }

  /**
   * Clear error queue
   */
  clearErrors(): void {
    this.errorQueue = [];
    localStorage.removeItem('error_logs');
  }
}

// Create singleton instance
export const errorMonitor = new ErrorMonitor();

// Export helper functions
export const captureError = (error: Error, context?: ErrorContext) => 
  errorMonitor.captureError(error, context);

export const captureMessage = (message: string, level?: 'info' | 'warning' | 'error', context?: ErrorContext) => 
  errorMonitor.captureMessage(message, level, context);

export const getRecentErrors = () => errorMonitor.getRecentErrors();

export const clearErrors = () => errorMonitor.clearErrors();
