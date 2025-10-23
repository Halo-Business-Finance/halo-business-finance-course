/**
 * Sanitize error messages to prevent information leakage
 * Removes database table names, schema details, and technical internals
 */

interface SanitizedError {
  message: string;
  originalCode?: string;
}

// Common database error patterns to sanitize
const DB_ERROR_PATTERNS = [
  { pattern: /permission denied for table (\w+)/gi, replacement: 'Access denied' },
  { pattern: /relation "(\w+)" does not exist/gi, replacement: 'Resource not found' },
  { pattern: /column "(\w+)" does not exist/gi, replacement: 'Invalid data format' },
  { pattern: /duplicate key value violates unique constraint/gi, replacement: 'This entry already exists' },
  { pattern: /null value in column "(\w+)" violates not-null constraint/gi, replacement: 'Required information is missing' },
  { pattern: /violates foreign key constraint/gi, replacement: 'Invalid reference' },
  { pattern: /invalid input syntax for type/gi, replacement: 'Invalid data format' },
  { pattern: /PGRST\d+/gi, replacement: '' }, // Remove Postgres REST error codes
  { pattern: /JWT.*expired/gi, replacement: 'Your session has expired. Please log in again.' },
  { pattern: /JWT.*invalid/gi, replacement: 'Authentication failed. Please log in again.' },
];

// Supabase error codes to user-friendly messages
const SUPABASE_ERROR_CODES: Record<string, string> = {
  'PGRST301': 'Your session has expired. Please log in again.',
  'PGRST302': 'Authentication failed. Please log in again.',
  '23505': 'This entry already exists.',
  '23503': 'Invalid reference to related data.',
  '23502': 'Required information is missing.',
  '42501': 'You do not have permission to perform this action.',
  '42P01': 'The requested resource was not found.',
};

/**
 * Sanitize an error object or message to remove sensitive information
 */
export function sanitizeError(error: any): SanitizedError {
  let message = 'An unexpected error occurred';
  let originalCode: string | undefined;

  // Extract error message
  if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    message = error.message;
  } else if (error?.error?.message) {
    message = error.error.message;
  }

  // Check for known error codes
  if (error?.code && SUPABASE_ERROR_CODES[error.code]) {
    return {
      message: SUPABASE_ERROR_CODES[error.code],
      originalCode: error.code,
    };
  }

  // Apply pattern-based sanitization
  for (const { pattern, replacement } of DB_ERROR_PATTERNS) {
    if (pattern.test(message)) {
      message = message.replace(pattern, replacement);
    }
  }

  // Additional cleanup - remove technical jargon
  message = message
    .replace(/\bschema\b/gi, 'system')
    .replace(/\btable\b/gi, 'resource')
    .replace(/\bcolumn\b/gi, 'field')
    .replace(/\bquery\b/gi, 'request')
    .replace(/\bRPC\b/gi, 'operation')
    .trim();

  // If message is empty or too technical, use generic message
  if (!message || message.length < 5 || /^[A-Z0-9_]+$/.test(message)) {
    message = 'An unexpected error occurred. Please try again.';
  }

  return { message, originalCode: error?.code };
}

/**
 * Sanitize database permission errors specifically
 */
export function sanitizePermissionError(error: any): string {
  const sanitized = sanitizeError(error);
  
  // Override with more specific permission messages if needed
  if (sanitized.message.toLowerCase().includes('permission') || 
      sanitized.message.toLowerCase().includes('access denied')) {
    return 'You do not have permission to access this information.';
  }

  return sanitized.message;
}

/**
 * Check if an error is authentication-related
 */
export function isAuthError(error: any): boolean {
  const code = error?.code || '';
  const message = error?.message || '';
  
  return (
    code === 'PGRST301' ||
    code === 'PGRST302' ||
    message.includes('JWT') ||
    message.includes('expired') ||
    message.includes('authentication')
  );
}

/**
 * Get a user-friendly error message for toast notifications
 */
export function getToastErrorMessage(error: any, defaultMessage?: string): string {
  const sanitized = sanitizeError(error);
  
  // If we have a default message and the error is generic, prefer the default
  if (defaultMessage && sanitized.message === 'An unexpected error occurred. Please try again.') {
    return defaultMessage;
  }
  
  return sanitized.message;
}
