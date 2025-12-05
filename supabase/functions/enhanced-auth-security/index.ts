import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Enhanced security headers with CSP
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const securityHeaders = {
  ...corsHeaders,
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: securityHeaders });
  }

  try {
    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('x-real-ip') ||
                     'unknown';

    const { action, email, endpoint = '/auth' } = await req.json();

    // Input validation
    if (!action || typeof action !== 'string') {
      throw new Error('Invalid action parameter');
    }

    // Validate allowed actions
    const allowedActions = ['check_rate_limit', 'log_failed_auth', 'log_successful_auth'];
    if (!allowedActions.includes(action)) {
      throw new Error('Invalid action specified');
    }

    // Validate email format if provided
    if (email && (typeof email !== 'string' || email.length > 255 || !email.includes('@'))) {
      throw new Error('Invalid email parameter');
    }

    // Validate endpoint format
    if (endpoint && (typeof endpoint !== 'string' || endpoint.length > 200)) {
      throw new Error('Invalid endpoint parameter');
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
          throw new Error('Rate limit check failed');
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
            console.error('Failed to log security event:', logError);
          }
        }

        // Trigger security analysis
        const { error: analysisError } = await supabase
          .rpc('analyze_security_events');

        if (analysisError) {
          // Log to console in development only
          if (Deno.env.get('ENV') === 'development') {
            console.error('Security analysis error:', analysisError);
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
            console.error('Failed to log successful auth:', successLogError);
          }
        }

        rateLimitResponse = { logged: true };
        break;

      default:
        throw new Error('Invalid action');
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

  } catch (error: any) {
    // Only log errors in development
    if (Deno.env.get('ENV') === 'development') {
      console.error('Enhanced auth security error:', error);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Security check failed' 
      }),
      {
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});