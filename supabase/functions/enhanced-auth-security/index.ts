import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  handleCorsPreflightRequest, 
  getSecurityHeaders,
  validateOrigin,
  isOriginAllowed
} from '../_shared/corsHelper.ts';

// Sanitize error messages to prevent information leakage
function sanitizeError(error: unknown): string {
  // Log detailed error server-side for debugging
  if (Deno.env.get('ENV') === 'development') {
    console.error('[enhanced-auth-security]', error);
  }
  
  // Return generic message to client
  return 'Security check failed. Please try again.';
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  // Note: For auth-related functions, we allow requests from unknown origins
  // because login/rate-limiting needs to work from any context
  // However, we still validate and log the origin for security monitoring
  const origin = req.headers.get('origin');
  if (origin && !isOriginAllowed(origin)) {
    if (Deno.env.get('ENV') === 'development') {
      console.warn(`[enhanced-auth-security] Request from non-standard origin: ${origin}`);
    }
    // Don't block - auth functions need to work from various contexts
    // but log for monitoring
  }

  // Get security headers for this request
  const securityHeaders = getSecurityHeaders(req);

  try {
    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('x-real-ip') ||
                     'unknown';

    const { action, email, endpoint = '/auth' } = await req.json();

    // Input validation
    if (!action || typeof action !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request', code: 'ERR_400' }),
        { headers: { ...securityHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate allowed actions
    const allowedActions = ['check_rate_limit', 'log_failed_auth', 'log_successful_auth'];
    if (!allowedActions.includes(action)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request', code: 'ERR_400' }),
        { headers: { ...securityHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate email format if provided
    if (email && (typeof email !== 'string' || email.length > 255 || !email.includes('@'))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request', code: 'ERR_400' }),
        { headers: { ...securityHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate endpoint format
    if (endpoint && (typeof endpoint !== 'string' || endpoint.length > 200)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request', code: 'ERR_400' }),
        { headers: { ...securityHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // Note: This function is intentionally callable without authentication for:
    // - check_rate_limit: Pre-auth rate limiting
    // - log_failed_auth: Logging failed login attempts
    // - log_successful_auth: Logging successful logins
    // However, we verify the auth header if provided for additional security context
    
    const authHeader = req.headers.get('Authorization');
    let authenticatedUser = null;
    
    if (authHeader) {
      const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: { user } } = await authClient.auth.getUser();
      authenticatedUser = user;
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    let rateLimitResponse;

    switch (action) {
      case 'check_rate_limit':
        // Check rate limit for this IP and endpoint
        const { data: rateLimitData, error: rateLimitError } = await supabase
          .rpc('check_rate_limit', {
            p_ip_address: clientIP,
            p_endpoint: endpoint,
            p_max_attempts: 5,
            p_window_minutes: 15
          });

        if (rateLimitError) {
          if (Deno.env.get('ENV') === 'development') {
            console.error('[rate_limit_check]', rateLimitError);
          }
          return new Response(
            JSON.stringify({ success: false, error: 'Service temporarily unavailable', code: 'ERR_503' }),
            { headers: { ...securityHeaders, 'Content-Type': 'application/json' }, status: 503 }
          );
        }

        rateLimitResponse = rateLimitData;
        break;

      case 'log_failed_auth':
        // Log failed authentication attempt
        const { error: logError } = await supabase
          .from('security_events')
          .insert({
            event_type: 'failed_login',
            severity: 'medium',
            details: {
              ip_address: clientIP,
              user_email: email,
              endpoint: endpoint,
              user_agent: req.headers.get('user-agent'),
              timestamp: new Date().toISOString(),
              failure_reason: 'invalid_credentials'
            },
            logged_via_secure_function: true
          });

        if (logError) {
          // Log to console in development only
          if (Deno.env.get('ENV') === 'development') {
            console.error('[log_failed_auth]', logError);
          }
        }

        // Trigger security analysis
        const { error: analysisError } = await supabase
          .rpc('analyze_security_events');

        if (analysisError) {
          // Log to console in development only
          if (Deno.env.get('ENV') === 'development') {
            console.error('[security_analysis]', analysisError);
          }
        }

        rateLimitResponse = { logged: true };
        break;

      case 'log_successful_auth':
        // Log successful authentication
        const { error: successLogError } = await supabase
          .from('security_events')
          .insert({
            event_type: 'successful_login',
            severity: 'low',
            user_id: authenticatedUser?.id,
            details: {
              ip_address: clientIP,
              user_email: email,
              endpoint: endpoint,
              user_agent: req.headers.get('user-agent'),
              timestamp: new Date().toISOString()
            },
            logged_via_secure_function: true
          });

        if (successLogError) {
          // Log to console in development only  
          if (Deno.env.get('ENV') === 'development') {
            console.error('[log_successful_auth]', successLogError);
          }
        }

        rateLimitResponse = { logged: true };
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid request', code: 'ERR_400' }),
          { headers: { ...securityHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: rateLimitResponse,
        security_headers_applied: true
      }),
      {
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: sanitizeError(error),
        code: 'ERR_500'
      }),
      {
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
