import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // ===== AUTHENTICATION CHECK =====
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Verify the user's JWT token
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired authentication token', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if user is admin
    const { data: userRole } = await authClient.rpc('get_user_role');
    if (!['admin', 'super_admin'].includes(userRole)) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    // ===== END AUTHENTICATION CHECK =====

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();

    let result = {};

    switch (action) {
      case 'analyze_patterns':
        // Run comprehensive pattern analysis
        const { error: patternError } = await supabase.rpc('analyze_access_patterns');
        if (patternError) throw patternError;
        
        // Get recent anomalies for response
        const { data: anomalies } = await supabase
          .from('access_anomalies')
          .select('*')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });

        result = {
          success: true,
          message: 'Pattern analysis completed',
          recent_anomalies: anomalies || [],
          analysis_timestamp: new Date().toISOString()
        };
        break;

      case 'get_user_anomalies':
        const { user_id } = params;
        if (!user_id) throw new Error('user_id required');

        const { data: userAnomalies } = await supabase
          .from('access_anomalies')
          .select(`
            *,
            login_locations!inner(country, city, ip_address)
          `)
          .eq('user_id', user_id)
          .order('created_at', { ascending: false })
          .limit(50);

        result = {
          success: true,
          anomalies: userAnomalies || [],
          user_id
        };
        break;

      case 'resolve_anomaly':
        const { anomaly_id, resolved_by } = params;
        if (!anomaly_id) throw new Error('anomaly_id required');

        const { error: resolveError } = await supabase
          .from('access_anomalies')
          .update({
            is_resolved: true,
            resolved_at: new Date().toISOString()
          })
          .eq('id', anomaly_id);

        if (resolveError) throw resolveError;

        // Log the resolution
        await supabase.from('security_events').insert({
          event_type: 'anomaly_resolved',
          severity: 'low',
          details: {
            anomaly_id,
            resolved_by: resolved_by || user.id,
            timestamp: new Date().toISOString()
          },
          user_id: resolved_by || user.id,
          logged_via_secure_function: true
        });

        result = {
          success: true,
          message: 'Anomaly resolved successfully',
          anomaly_id
        };
        break;

      case 'get_anomaly_stats':
        // Get anomaly statistics
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [
          { count: totalAnomalies },
          { count: criticalAnomalies },
          { count: recentAnomalies },
          { count: unresolvedAnomalies }
        ] = await Promise.all([
          supabase.from('access_anomalies').select('*', { count: 'exact', head: true }),
          supabase.from('access_anomalies').select('*', { count: 'exact', head: true }).eq('severity', 'critical'),
          supabase.from('access_anomalies').select('*', { count: 'exact', head: true }).gte('created_at', twentyFourHoursAgo),
          supabase.from('access_anomalies').select('*', { count: 'exact', head: true }).eq('is_resolved', false)
        ]);

        // Get trend data (last 7 days)
        const { data: trendData } = await supabase
          .from('access_anomalies')
          .select('created_at, severity')
          .gte('created_at', sevenDaysAgo)
          .order('created_at', { ascending: true });

        result = {
          success: true,
          stats: {
            total_anomalies: totalAnomalies || 0,
            critical_anomalies: criticalAnomalies || 0,
            recent_anomalies_24h: recentAnomalies || 0,
            unresolved_anomalies: unresolvedAnomalies || 0,
            trend_data: trendData || []
          }
        };
        break;

      case 'bulk_analyze':
        // Analyze multiple users for bulk anomaly detection
        const { user_ids } = params;
        if (!user_ids || !Array.isArray(user_ids)) {
          throw new Error('user_ids array required');
        }

        const bulkResults = [];
        for (const userId of user_ids) {
          try {
            // Get recent login locations for this user
            const { data: recentLogins } = await supabase
              .from('login_locations')
              .select('*')
              .eq('user_id', userId)
              .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
              .order('created_at', { ascending: false });

            if (recentLogins && recentLogins.length > 0) {
              // Check for suspicious patterns
              const uniqueCountries = new Set(recentLogins.map(l => l.country)).size;
              const uniqueIPs = new Set(recentLogins.map(l => l.ip_address)).size;
              const totalLogins = recentLogins.length;

              let suspiciousScore = 0;
              if (uniqueCountries > 3) suspiciousScore += 30;
              if (uniqueIPs > 10) suspiciousScore += 40;
              if (totalLogins > 50) suspiciousScore += 20;

              if (suspiciousScore >= 50) {
                // Create anomaly record
                await supabase.from('access_anomalies').insert({
                  user_id: userId,
                  anomaly_type: 'bulk_analysis_suspicious_pattern',
                  severity: suspiciousScore >= 80 ? 'high' : 'medium',
                  pattern_data: {
                    unique_countries: uniqueCountries,
                    unique_ips: uniqueIPs,
                    total_logins: totalLogins,
                    analysis_period_days: 7
                  },
                  detection_method: 'bulk_pattern_analysis',
                  confidence_score: suspiciousScore
                });

                bulkResults.push({
                  user_id: userId,
                  suspicious: true,
                  score: suspiciousScore,
                  patterns: {
                    unique_countries: uniqueCountries,
                    unique_ips: uniqueIPs,
                    total_logins: totalLogins
                  }
                });
              } else {
                bulkResults.push({
                  user_id: userId,
                  suspicious: false,
                  score: suspiciousScore
                });
              }
            }
          } catch (error) {
            if (Deno.env.get('ENV') === 'development') {
              console.error(`Error analyzing user ${userId}:`, error);
            }
            bulkResults.push({
              user_id: userId,
              error: error.message
            });
          }
        }

        result = {
          success: true,
          message: 'Bulk analysis completed',
          results: bulkResults,
          analyzed_users: user_ids.length
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    if (Deno.env.get('ENV') === 'development') {
      console.error('Anomaly detection error:', error);
    }
    return new Response(JSON.stringify({
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});