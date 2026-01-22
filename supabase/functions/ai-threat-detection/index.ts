import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { 
  handleCorsPreflightRequest, 
  createSecureJsonResponse, 
  createSecureErrorResponse,
  getSecurityHeaders,
  validateOrigin
} from '../_shared/corsHelper.ts';
import { validateInput, threatDetectionSchema } from '../_shared/inputValidation.ts';

interface ThreatAnalysis {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  threatType: string;
  confidence: number;
  reasoning: string;
  recommendedActions: string[];
  patterns: string[];
  riskScore: number;
}

interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  severity: string;
  details: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  // Validate origin
  const originError = validateOrigin(req);
  if (originError) return originError;
  const securityHeaders = getSecurityHeaders(req);

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return createSecureErrorResponse(req, 'Service temporarily unavailable', 503);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // ===== AUTHENTICATION CHECK =====
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createSecureErrorResponse(req, 'Authentication required', 401, 'ERR_401');
    }

    // Verify the user's JWT token
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return createSecureErrorResponse(req, 'Invalid or expired authentication token', 401, 'ERR_401');
    }

    // Check if user is admin
    const { data: userRole } = await authClient.rpc('get_user_role');
    if (!['admin', 'super_admin'].includes(userRole)) {
      return createSecureErrorResponse(req, 'Admin privileges required', 403, 'ERR_403');
    }
    // ===== END AUTHENTICATION CHECK =====

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate input
    const requestBody = await req.json();
    const validation = validateInput<{ events?: any[]; analysisType?: string }>(
      requestBody,
      threatDetectionSchema
    );

    if (!validation.success) {
      return createSecureErrorResponse(req, validation.errors?.join(', ') || 'Invalid input', 400, 'ERR_VALIDATION');
    }

    const { events, analysisType = 'batch' } = validation.data!;

    if (Deno.env.get('ENV') === 'development') {
      console.log(`[AI-THREAT-DETECTION] Starting ${analysisType} analysis for ${events?.length || 0} events`);
    }

    // Fetch recent security events for context if not provided
    let securityEvents = events;
    if (!securityEvents) {
      const { data: recentEvents } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      securityEvents = recentEvents || [];
    }

    // Prepare context for AI analysis
    const analysisContext = {
      timestamp: new Date().toISOString(),
      eventCount: securityEvents.length,
      timeWindow: '24 hours',
      events: securityEvents.map((event: SecurityEvent) => ({
        type: event.event_type,
        severity: event.severity,
        timestamp: event.created_at,
        details: event.details,
        user_id: event.user_id,
        ip_address: event.ip_address
      }))
    };

    // Create comprehensive AI prompt for threat analysis
    const threatAnalysisPrompt = `
You are an elite cybersecurity analyst with expertise in threat detection and behavioral analysis. Analyze the following security events from a business finance LMS platform and provide a comprehensive threat assessment.

SECURITY EVENTS DATA:
${JSON.stringify(analysisContext, null, 2)}

ANALYSIS REQUIREMENTS:
1. Threat Level Assessment (low/medium/high/critical)
2. Threat Type Classification (insider threat, external attack, credential stuffing, data breach, etc.)
3. Confidence Score (0-100)
4. Detailed Reasoning
5. Recommended Actions
6. Pattern Recognition
7. Risk Score (0-100)

CRITICAL FACTORS TO CONSIDER:
- Failed login patterns and frequency
- Administrative action patterns
- Data access anomalies
- Geographic inconsistencies
- Time-based behavioral changes
- Privilege escalation attempts
- Bulk data access patterns
- Account compromise indicators

RESPONSE FORMAT (JSON):
{
  "threatLevel": "low|medium|high|critical",
  "threatType": "specific threat classification",
  "confidence": 85,
  "reasoning": "Detailed analysis of why this threat level was assigned",
  "recommendedActions": ["action1", "action2", "action3"],
  "patterns": ["pattern1", "pattern2"],
  "riskScore": 75,
  "specificFindings": {
    "suspiciousIPs": [],
    "compromisedAccounts": [],
    "anomalousActivities": [],
    "behavioralChanges": []
  },
  "timelineAnalysis": "Analysis of event timing and patterns",
  "complianceImpact": "GDPR, SOC2, or other compliance implications"
}

Provide actionable, specific insights that can help secure this business finance platform.
`;

    if (Deno.env.get('ENV') === 'development') {
      console.log('[AI-THREAT-DETECTION] Sending analysis request to OpenAI');
    }

    // Call OpenAI GPT-5 for threat analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a cybersecurity expert specializing in threat detection and analysis. Always respond with valid JSON and provide actionable security insights.'
          },
          {
            role: 'user',
            content: threatAnalysisPrompt
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      if (Deno.env.get('ENV') === 'development') {
        console.error('[AI-THREAT-DETECTION] OpenAI API error:', error);
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    if (Deno.env.get('ENV') === 'development') {
      console.log('[AI-THREAT-DETECTION] Received response from OpenAI');
    }

    let analysis: ThreatAnalysis;
    try {
      analysis = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      if (Deno.env.get('ENV') === 'development') {
        console.error('[AI-THREAT-DETECTION] Failed to parse AI response:', parseError);
      }
      // Fallback basic analysis
      analysis = {
        threatLevel: 'medium',
        threatType: 'analysis_error',
        confidence: 30,
        reasoning: 'AI analysis parsing failed, manual review required',
        recommendedActions: ['Review security events manually', 'Check AI system status'],
        patterns: ['system_error'],
        riskScore: 50
      };
    }

    // Store the analysis results
    const { error: insertError } = await supabase
      .from('ai_threat_analyses')
      .insert({
        analysis_type: analysisType,
        threat_level: analysis.threatLevel,
        threat_type: analysis.threatType,
        confidence_score: analysis.confidence,
        risk_score: analysis.riskScore,
        reasoning: analysis.reasoning,
        recommended_actions: analysis.recommendedActions,
        detected_patterns: analysis.patterns,
        analysis_data: analysis,
        events_analyzed: securityEvents.length,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      if (Deno.env.get('ENV') === 'development') {
        console.error('[AI-THREAT-DETECTION] Failed to store analysis:', insertError);
      }
    }

    // Create security alerts for high/critical threats
    if (analysis.threatLevel === 'high' || analysis.threatLevel === 'critical') {
      const { error: alertError } = await supabase
        .from('security_alerts')
        .insert({
          alert_type: `ai_detected_${analysis.threatType}`,
          severity: analysis.threatLevel,
          title: `AI Detected ${analysis.threatType.replace('_', ' ').toUpperCase()} Threat`,
          description: analysis.reasoning,
          metadata: {
            confidence: analysis.confidence,
            riskScore: analysis.riskScore,
            patterns: analysis.patterns,
            actions: analysis.recommendedActions,
            aiGenerated: true
          },
          is_resolved: false,
          created_at: new Date().toISOString()
        });

      if (alertError) {
        if (Deno.env.get('ENV') === 'development') {
          console.error('[AI-THREAT-DETECTION] Failed to create alert:', alertError);
        }
      }
    }

    if (Deno.env.get('ENV') === 'development') {
      console.log(`[AI-THREAT-DETECTION] Analysis complete: ${analysis.threatLevel} threat detected with ${analysis.confidence}% confidence`);
    }

    return createSecureJsonResponse(req, {
      success: true,
      analysis,
      eventsAnalyzed: securityEvents.length,
      aiPowered: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (Deno.env.get('ENV') === 'development') {
      console.error('[AI-THREAT-DETECTION] Error:', error);
    }
    return createSecureErrorResponse(req, 'Threat analysis failed. Please try again.', 500);
  }
});