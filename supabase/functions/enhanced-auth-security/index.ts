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
  console.log('Enhanced auth security function called:', req.method);

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

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

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
          console.error('Rate limit check error:', rateLimitError);
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
            }
          });

        if (logError) {
          console.error('Failed to log security event:', logError);
        }

        // Trigger security analysis
        const { error: analysisError } = await supabase
          .rpc('analyze_security_events');

        if (analysisError) {
          console.error('Security analysis error:', analysisError);
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
            details: {
              ip_address: clientIP,
              user_email: email,
              endpoint: endpoint,
              user_agent: req.headers.get('user-agent'),
              timestamp: new Date().toISOString()
            }
          });

        if (successLogError) {
          console.error('Failed to log successful auth:', successLogError);
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
    console.error('Enhanced auth security error:', error);
    
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