import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // ===== AUTHENTICATION CHECK =====
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Verify the user's JWT token
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired authentication token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if user is super_admin (only super admins can run data retention cleanup)
    const { data: userRole } = await authClient.rpc('get_user_role');
    if (userRole !== 'super_admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Super admin privileges required for data retention operations' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    // ===== END AUTHENTICATION CHECK =====

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    if (Deno.env.get('ENV') === 'development') {
      console.log('[SECURITY-RETENTION] Starting automated data retention cleanup...');
    }

    // Call the cleanup function
    const { data, error } = await supabaseClient.rpc('cleanup_old_behavioral_data');

    if (error) {
      if (Deno.env.get('ENV') === 'development') {
        console.error('[SECURITY-RETENTION] Cleanup failed:', error);
      }
      throw error;
    }

    if (Deno.env.get('ENV') === 'development') {
      console.log('[SECURITY-RETENTION] Data retention cleanup completed successfully');
    }

    // Also clean up old rate limit entries
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep 7 days of rate limit data

    const { error: rateLimitError } = await supabaseClient
      .from('lead_submission_rate_limits')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (rateLimitError) {
      if (Deno.env.get('ENV') === 'development') {
        console.warn('[SECURITY-RETENTION] Rate limit cleanup warning:', rateLimitError);
      }
    }

    const { error: advancedRateLimitError } = await supabaseClient
      .from('advanced_rate_limits')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (advancedRateLimitError) {
      if (Deno.env.get('ENV') === 'development') {
        console.warn('[SECURITY-RETENTION] Advanced rate limit cleanup warning:', advancedRateLimitError);
      }
    }

    // Log the successful cleanup
    const { error: logError } = await supabaseClient
      .from('security_events')
      .insert({
        event_type: 'automated_data_retention_completed',
        severity: 'low',
        user_id: user.id,
        details: {
          cleanup_timestamp: new Date().toISOString(),
          cleanup_type: 'scheduled_retention',
          automated: true,
          gdpr_compliant: true,
          rate_limit_cleanup: true,
          initiated_by: user.email
        },
        logged_via_secure_function: true
      });

    if (logError) {
      if (Deno.env.get('ENV') === 'development') {
        console.warn('[SECURITY-RETENTION] Logging warning:', logError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data retention cleanup completed successfully',
        timestamp: new Date().toISOString(),
        initiated_by: user.email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    if (Deno.env.get('ENV') === 'development') {
      console.error('[SECURITY-RETENTION] Function error:', error);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})