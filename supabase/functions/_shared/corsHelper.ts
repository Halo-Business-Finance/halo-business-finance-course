/**
 * Secure CORS Helper for Edge Functions
 * 
 * This module provides origin-validated CORS headers to prevent
 * cross-site request attacks from malicious websites.
 */

// Allowed origins - production and development
const ALLOWED_ORIGINS: string[] = [
  // Production domains
  'https://halo-business-finance-course.lovable.app',
  'https://id-preview--2b8432fc-0bfb-4d98-9d4c-60c0f079104d.lovable.app',
  // Supabase domain
  'https://kagwfntxlgzrcngysmlt.supabase.co',
];

// Development origins (only active when ENV=development)
const DEV_ORIGINS: string[] = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
];

/**
 * Get the list of allowed origins based on environment
 */
export function getAllowedOrigins(): string[] {
  const isDev = Deno.env.get('ENV') === 'development';
  return isDev ? [...ALLOWED_ORIGINS, ...DEV_ORIGINS] : ALLOWED_ORIGINS;
}

/**
 * Check if an origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  const allowedOrigins = getAllowedOrigins();
  
  // Exact match check
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Check for Lovable preview URLs pattern
  const lovablePreviewPattern = /^https:\/\/[a-zA-Z0-9-]+--[a-f0-9-]+\.lovable\.app$/;
  if (lovablePreviewPattern.test(origin)) {
    return true;
  }
  
  return false;
}

/**
 * Get secure CORS headers for a request
 */
export function getSecureCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const isAllowed = isOriginAllowed(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Get full security headers including CORS
 */
export function getSecurityHeaders(req: Request): Record<string, string> {
  return {
    ...getSecureCorsHeaders(req),
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getSecurityHeaders(req) });
  }
  return null;
}

/**
 * Create a JSON response with secure headers
 */
export function createSecureJsonResponse(
  req: Request,
  data: unknown,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getSecurityHeaders(req),
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create an error response with secure headers
 */
export function createSecureErrorResponse(
  req: Request,
  message: string,
  status: number = 400,
  code?: string
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      ...(code ? { code } : {}),
    }),
    {
      status,
      headers: {
        ...getSecurityHeaders(req),
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Validate request origin and return error response if not allowed
 */
export function validateOrigin(req: Request): Response | null {
  const origin = req.headers.get('origin');
  
  // Allow requests without origin header (same-origin, curl, etc.)
  if (!origin) {
    return null;
  }
  
  if (!isOriginAllowed(origin)) {
    if (Deno.env.get('ENV') === 'development') {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
    }
    return createSecureErrorResponse(
      req,
      'Origin not allowed',
      403,
      'ERR_FORBIDDEN_ORIGIN'
    );
  }
  
  return null;
}
