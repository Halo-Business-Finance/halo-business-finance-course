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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('[SECURITY-RETENTION] Starting automated data retention cleanup...');

    // Call the cleanup function
    const { data, error } = await supabaseClient.rpc('cleanup_old_behavioral_data');

    if (error) {
      console.error('[SECURITY-RETENTION] Cleanup failed:', error);
      throw error;
    }

    console.log('[SECURITY-RETENTION] Data retention cleanup completed successfully');

    // Also clean up old rate limit entries
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep 7 days of rate limit data

    const { error: rateLimitError } = await supabaseClient
      .from('lead_submission_rate_limits')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (rateLimitError) {
      console.warn('[SECURITY-RETENTION] Rate limit cleanup warning:', rateLimitError);
    }

    const { error: advancedRateLimitError } = await supabaseClient
      .from('advanced_rate_limits')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (advancedRateLimitError) {
      console.warn('[SECURITY-RETENTION] Advanced rate limit cleanup warning:', advancedRateLimitError);
    }

    // Log the successful cleanup
    const { error: logError } = await supabaseClient
      .from('security_events')
      .insert({
        event_type: 'automated_data_retention_completed',
        severity: 'low',
        details: {
          cleanup_timestamp: new Date().toISOString(),
          cleanup_type: 'scheduled_retention',
          automated: true,
          gdpr_compliant: true,
          rate_limit_cleanup: true
        },
        logged_via_secure_function: true
      });

    if (logError) {
      console.warn('[SECURITY-RETENTION] Logging warning:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data retention cleanup completed successfully',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('[SECURITY-RETENTION] Function error:', error);
    
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