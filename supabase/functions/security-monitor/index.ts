import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Security headers
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
  console.log('Security monitor function called:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: securityHeaders });
  }

  try {
    // Verify this is a POST request
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { action } = await req.json();

    // Create Supabase admin client
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

    let response;

    switch (action) {
      case 'get_security_alerts':
        // Get unresolved security alerts
        const { data: alerts, error: alertsError } = await supabase
          .from('security_alerts')
          .select('*')
          .eq('is_resolved', false)
          .order('created_at', { ascending: false })
          .limit(50);

        if (alertsError) {
          throw new Error(`Failed to fetch alerts: ${alertsError.message}`);
        }

        response = { alerts: alerts || [] };
        break;

      case 'resolve_alert':
        const { alertId, resolvedBy } = await req.json();
        
        if (!alertId) {
          throw new Error('Alert ID is required');
        }

        // Mark alert as resolved
        const { error: resolveError } = await supabase
          .from('security_alerts')
          .update({
            is_resolved: true,
            resolved_at: new Date().toISOString(),
            resolved_by: resolvedBy,
            updated_at: new Date().toISOString()
          })
          .eq('id', alertId);

        if (resolveError) {
          throw new Error(`Failed to resolve alert: ${resolveError.message}`);
        }

        response = { success: true, message: 'Alert resolved successfully' };
        break;

      case 'analyze_security_events':
        // Run security analysis
        const { error: analysisError } = await supabase
          .rpc('analyze_security_events');

        if (analysisError) {
          throw new Error(`Security analysis failed: ${analysisError.message}`);
        }

        response = { success: true, message: 'Security analysis completed' };
        break;

      case 'get_security_dashboard':
        // Get comprehensive security dashboard data
        const [alertsResult, eventsResult, rateLimitsResult] = await Promise.allSettled([
          supabase
            .from('security_alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('security_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50),
          supabase
            .from('rate_limit_attempts')
            .select('*')
            .eq('is_blocked', true)
            .order('created_at', { ascending: false })
            .limit(20)
        ]);

        response = {
          alerts: alertsResult.status === 'fulfilled' ? alertsResult.value.data || [] : [],
          recent_events: eventsResult.status === 'fulfilled' ? eventsResult.value.data || [] : [],
          blocked_ips: rateLimitsResult.status === 'fulfilled' ? rateLimitsResult.value.data || [] : [],
          dashboard_generated_at: new Date().toISOString()
        };
        break;

      case 'create_test_alert':
        // Create a test security alert for demonstration
        const { data: testAlert, error: testError } = await supabase
          .rpc('create_security_alert', {
            p_alert_type: 'test_alert',
            p_severity: 'low',
            p_title: 'Test Security Alert',
            p_description: 'This is a test alert to verify the security monitoring system is working correctly.',
            p_metadata: JSON.stringify({
              test: true,
              created_by: 'security_monitor_function',
              timestamp: new Date().toISOString()
            })
          });

        if (testError) {
          throw new Error(`Failed to create test alert: ${testError.message}`);
        }

        response = { 
          success: true, 
          message: 'Test alert created successfully',
          alert_id: testAlert
        };
        break;

      default:
        throw new Error('Invalid action specified');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Security monitor error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Security monitoring failed',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});