import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const securityHeaders = {
  ...corsHeaders,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: securityHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get client information
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const requestPath = new URL(req.url).pathname

    const { action, data = {} } = await req.json()

    switch (action) {
      case 'detect_threat': {
        const { 
          event_type, 
          severity = 'medium',
          threat_indicators = {},
          auto_block = false 
        } = data

        console.log(`[MILITARY-SECURITY] Threat detected: ${event_type} from ${clientIP}`)

        // Advanced threat analysis
        const threatScore = analyzeThreatLevel(threat_indicators, userAgent, clientIP)
        const shouldAutoBlock = threatScore >= 8 || auto_block

        // Log threat to database
        const { data: threatId, error: threatError } = await supabase
          .rpc('log_security_threat', {
            p_event_type: event_type,
            p_severity: severity,
            p_source_ip: clientIP,
            p_user_agent: userAgent,
            p_request_path: requestPath,
            p_threat_indicators: {
              ...threat_indicators,
              threat_score: threatScore,
              timestamp: new Date().toISOString(),
              automated_analysis: true
            },
            p_auto_block: shouldAutoBlock
          })

        if (threatError) {
          console.error('[MILITARY-SECURITY] Failed to log threat:', threatError)
        }

        // Immediate response for high-level threats
        if (shouldAutoBlock) {
          console.log(`[MILITARY-SECURITY] AUTO-BLOCKING threat ${event_type} (score: ${threatScore})`)
          
          // Add to advanced rate limits for blocking
          await supabase
            .from('advanced_rate_limits')
            .upsert({
              identifier: clientIP,
              endpoint: requestPath,
              is_blocked: true,
              block_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
              threat_level: threatScore
            })
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            threat_id: threatId,
            threat_score: threatScore,
            auto_blocked: shouldAutoBlock,
            action_taken: shouldAutoBlock ? 'BLOCKED' : 'MONITORED'
          }),
          { headers: securityHeaders }
        )
      }

      case 'analyze_session': {
        const { user_id, session_data = {} } = data

        console.log(`[MILITARY-SECURITY] Analyzing session for user: ${user_id}`)

        // Advanced session security analysis
        const sessionRisk = analyzeSessionRisk(session_data, userAgent, clientIP)

        // Log session analysis
        await supabase
          .from('security_events')
          .insert({
            user_id,
            event_type: 'military_session_analysis',
            severity: sessionRisk >= 7 ? 'high' : sessionRisk >= 4 ? 'medium' : 'low',
            details: {
              session_risk_score: sessionRisk,
              client_ip: clientIP,
              user_agent: userAgent,
              analysis_timestamp: new Date().toISOString(),
              security_level: 'military_grade'
            }
          })

        return new Response(
          JSON.stringify({ 
            success: true, 
            session_risk_score: sessionRisk,
            security_recommendation: getSecurityRecommendation(sessionRisk)
          }),
          { headers: securityHeaders }
        )
      }

      case 'check_advanced_rate_limit': {
        const { identifier, endpoint } = data

        const { data: rateLimit, error } = await supabase
          .from('advanced_rate_limits')
          .select('*')
          .eq('identifier', identifier)
          .eq('endpoint', endpoint)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        const isBlocked = rateLimit?.is_blocked && 
          rateLimit.block_until && 
          new Date(rateLimit.block_until) > new Date()

        return new Response(
          JSON.stringify({ 
            blocked: isBlocked,
            threat_level: rateLimit?.threat_level || 0,
            block_until: rateLimit?.block_until,
            message: isBlocked ? 'Access temporarily restricted due to security concerns' : 'Access allowed'
          }),
          { headers: securityHeaders }
        )
      }

      case 'security_dashboard_data': {
        console.log('[MILITARY-SECURITY] Generating security dashboard data')

        // Get threat summary for last 24 hours
        const { data: threats } = await supabase
          .from('threat_detection_events')
          .select('*')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })

        const { data: securityEvents } = await supabase
          .from('security_events')
          .select('*')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(50)

        const threatStats = {
          total_threats: threats?.length || 0,
          critical_threats: threats?.filter(t => t.severity === 'critical').length || 0,
          auto_blocked: threats?.filter(t => t.is_blocked).length || 0,
          unique_ips: new Set(threats?.map(t => t.source_ip).filter(Boolean)).size
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            threat_stats: threatStats,
            recent_threats: threats?.slice(0, 10) || [],
            recent_security_events: securityEvents || []
          }),
          { headers: securityHeaders }
        )
      }

      case 'remediate_threat': {
        const { threat_id, action_type, target_ip } = data

        console.log(`[MILITARY-SECURITY] Remediating threat ${threat_id} with action: ${action_type}`)

        let remediationResult = { success: false, message: 'Unknown remediation action' }

        switch (action_type) {
          case 'block_ip': {
            // Block the IP for 24 hours
            const { error } = await supabase
              .from('advanced_rate_limits')
              .upsert({
                identifier: target_ip,
                endpoint: '*',
                is_blocked: true,
                block_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                threat_level: 10,
                request_count: 0
              })

            if (!error) {
              // Log the remediation action
              await supabase.from('security_events').insert({
                event_type: 'threat_remediation_ip_blocked',
                severity: 'medium',
                details: {
                  threat_id,
                  blocked_ip: target_ip,
                  action: 'manual_ip_block',
                  duration_hours: 24,
                  timestamp: new Date().toISOString()
                }
              })

              remediationResult = { success: true, message: `IP ${target_ip} blocked for 24 hours` }
            }
            break
          }

          case 'clear_sessions': {
            // Clear all active sessions for suspicious users
            const { error } = await supabase
              .from('user_sessions')
              .update({ 
                is_active: false, 
                terminated_at: new Date().toISOString(),
                termination_reason: 'security_remediation'
              })
              .eq('ip_address', target_ip)

            if (!error) {
              await supabase.from('security_events').insert({
                event_type: 'threat_remediation_sessions_cleared',
                severity: 'high',
                details: {
                  threat_id,
                  target_ip,
                  action: 'clear_suspicious_sessions',
                  timestamp: new Date().toISOString()
                }
              })

              remediationResult = { success: true, message: `All sessions from IP ${target_ip} terminated` }
            }
            break
          }

          case 'enable_enhanced_monitoring': {
            // Enable enhanced monitoring for the IP
            await supabase.from('security_events').insert({
              event_type: 'enhanced_monitoring_enabled',
              severity: 'low',
              details: {
                threat_id,
                target_ip,
                monitoring_duration_hours: 72,
                enhanced_logging: true,
                timestamp: new Date().toISOString()
              }
            })

            remediationResult = { success: true, message: `Enhanced monitoring enabled for IP ${target_ip}` }
            break
          }

          case 'auto_remediate': {
            // Perform automatic remediation based on threat level
            const { data: threat } = await supabase
              .from('threat_detection_events')
              .select('*')
              .eq('id', threat_id)
              .single()

            if (threat) {
              const threatScore = threat.threat_indicators?.threat_score || 0

              if (threatScore >= 8) {
                // High threat: Block IP and clear sessions
                await supabase.from('advanced_rate_limits').upsert({
                  identifier: threat.source_ip,
                  endpoint: '*',
                  is_blocked: true,
                  block_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  threat_level: threatScore
                })

                await supabase.from('user_sessions').update({ 
                  is_active: false, 
                  terminated_at: new Date().toISOString(),
                  termination_reason: 'auto_security_remediation'
                }).eq('ip_address', threat.source_ip)

                remediationResult = { success: true, message: `Auto-remediation: IP blocked and sessions cleared` }
              } else if (threatScore >= 5) {
                // Medium threat: Enable enhanced monitoring
                await supabase.from('security_events').insert({
                  event_type: 'auto_enhanced_monitoring',
                  severity: 'medium',
                  details: {
                    threat_id,
                    target_ip: threat.source_ip,
                    threat_score: threatScore,
                    auto_remediation: true
                  }
                })

                remediationResult = { success: true, message: `Auto-remediation: Enhanced monitoring activated` }
              }
            }
            break
          }
        }

        return new Response(
          JSON.stringify(remediationResult),
          { headers: securityHeaders }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: securityHeaders }
        )
    }

  } catch (error) {
    console.error('[MILITARY-SECURITY] Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: securityHeaders }
    )
  }
})

// Advanced threat analysis algorithms
function analyzeThreatLevel(indicators: any, userAgent: string, clientIP: string): number {
  let score = 0

  // Bot detection
  if (userAgent.toLowerCase().includes('bot') || userAgent.toLowerCase().includes('crawler')) {
    score += 3
  }

  // Suspicious user agents
  if (userAgent.length < 10 || userAgent.includes('curl') || userAgent.includes('wget')) {
    score += 4
  }

  // Rapid requests (if provided in indicators)
  if (indicators.rapid_requests) {
    score += Math.min(indicators.rapid_requests / 2, 5)
  }

  // Multiple failed authentications
  if (indicators.failed_auth_count && indicators.failed_auth_count > 3) {
    score += Math.min(indicators.failed_auth_count, 6)
  }

  // Suspicious input patterns
  if (indicators.suspicious_input) {
    score += 3
  }

  // Known malicious patterns
  if (indicators.sql_injection_attempt || indicators.xss_attempt) {
    score += 8
  }

  return Math.min(score, 10)
}

function analyzeSessionRisk(sessionData: any, userAgent: string, clientIP: string): number {
  let risk = 0

  // Device fingerprint changes
  if (sessionData.device_changed) {
    risk += 3
  }

  // Geolocation anomalies
  if (sessionData.location_anomaly) {
    risk += 4
  }

  // Time-based anomalies
  if (sessionData.unusual_hours) {
    risk += 2
  }

  // Session hijacking indicators
  if (sessionData.multiple_ips || sessionData.concurrent_sessions > 3) {
    risk += 5
  }

  return Math.min(risk, 10)
}

function getSecurityRecommendation(riskScore: number): string {
  if (riskScore >= 8) return 'IMMEDIATE_MFA_REQUIRED'
  if (riskScore >= 6) return 'ADDITIONAL_VERIFICATION_RECOMMENDED'
  if (riskScore >= 4) return 'MONITOR_CLOSELY'
  return 'NORMAL_OPERATION'
}