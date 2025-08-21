import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { ...corsHeaders, ...securityHeaders },
      status: 200 
    })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (roleError || !roleData || !['admin', 'super_admin'].includes(roleData.role)) {
      throw new Error('Insufficient permissions')
    }

    // Get security metrics using the database function
    const { data: metrics, error: metricsError } = await supabaseClient
      .rpc('get_security_metrics')

    if (metricsError) {
      throw new Error(`Failed to get security metrics: ${metricsError.message}`)
    }

    // Get additional real-time data
    const [alertsResult, eventsResult, blockedIpsResult] = await Promise.all([
      supabaseClient
        .from('security_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(5),
      
      supabaseClient
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
      
      supabaseClient
        .from('rate_limit_attempts')
        .select('ip_address, attempt_count, is_blocked, updated_at')
        .eq('is_blocked', true)
        .order('updated_at', { ascending: false })
        .limit(10)
    ])

    const responseData = {
      metrics,
      recent_alerts: alertsResult.data || [],
      recent_events: eventsResult.data || [],
      blocked_ips: blockedIpsResult.data || [],
      timestamp: new Date().toISOString()
    }

    return new Response(JSON.stringify(responseData), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders,
        ...securityHeaders
      },
      status: 200
    })

  } catch (error) {
    console.error('Security metrics error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders,
        ...securityHeaders
      },
      status: error.message.includes('permissions') ? 403 : 500
    })
  }
})