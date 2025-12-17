/**
 * Shared error sanitization utility for edge functions
 * Prevents information leakage by mapping internal errors to safe user messages
 */

// Map of error patterns to safe user-facing messages
const ERROR_MAP: Record<string, string> = {
  'duplicate key': 'This operation conflicts with existing data',
  'foreign key': 'Related data not found',
  'not found': 'Resource not available',
  'permission denied': 'You do not have permission to perform this action',
  'rate limit': 'Too many requests. Please try again later',
  'authentication': 'Authentication failed',
  'authorization': 'Access denied',
  'invalid': 'Invalid request',
  'timeout': 'Request timed out. Please try again',
  'network': 'Network error. Please try again',
  'constraint': 'Data validation failed',
  'violation': 'Operation not allowed',
  'overflow': 'Data limit exceeded',
  'syntax': 'Invalid request format',
  'connection': 'Service temporarily unavailable',
};

// Generic fallback message
const GENERIC_ERROR = 'Operation failed. Please try again or contact support.';

/**
 * Sanitizes error messages for client responses
 * @param error - The original error object or message
 * @returns A safe, user-friendly error message
 */
export function sanitizeError(error: Error | string | unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();
  
  // Check for known error patterns
  for (const [pattern, safeMessage] of Object.entries(ERROR_MAP)) {
    if (lowerMessage.includes(pattern)) {
      return safeMessage;
    }
  }
  
  return GENERIC_ERROR;
}

/**
 * Creates a sanitized error response
 * @param error - The original error
 * @param statusCode - HTTP status code (default 400)
 * @param headers - Response headers
 * @returns Response object with sanitized error
 */
export function createSanitizedErrorResponse(
  error: Error | string | unknown,
  statusCode: number = 400,
  headers: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({ 
      error: sanitizeError(error),
      code: `ERR_${statusCode}`
    }),
    {
      status: statusCode,
      headers: { ...headers, 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Logs error details server-side (only in development)
 * @param context - Context string for the error
 * @param error - The error to log
 */
export function logErrorServerSide(context: string, error: unknown): void {
  // Only log detailed errors in development
  if (Deno.env.get('ENV') === 'development') {
    console.error(`[${context}]`, error);
  }
}
