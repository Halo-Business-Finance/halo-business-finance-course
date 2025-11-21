import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    // Authentication check - CRITICAL SECURITY
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ 
        error: 'Invalid authentication credentials'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { question, moduleTitle, moduleContext } = await req.json();
    
    // Input validation - CRITICAL SECURITY
    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ 
        error: 'Valid question is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Length validation
    if (question.length > 1000) {
      return new Response(JSON.stringify({ 
        error: 'Question must be less than 1000 characters'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (question.length < 3) {
      return new Response(JSON.stringify({ 
        error: 'Question must be at least 3 characters'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prompt injection detection - basic patterns
    const suspiciousPatterns = [
      /ignore\s+previous\s+instructions/i,
      /ignore\s+all\s+previous/i,
      /system\s*:/i,
      /assistant\s*:/i,
      /you\s+are\s+now/i,
      /disregard/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(question)) {
        return new Response(JSON.stringify({ 
          error: 'Invalid question format detected'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Sanitize input - remove excessive whitespace and control characters
    const sanitizedQuestion = question
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (!sanitizedQuestion) {
      return new Response(JSON.stringify({ 
        error: 'Question cannot be empty'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert finance and commercial lending instructor helping students with questions about their learning module. 

Module Context: "${moduleTitle}"
${moduleContext ? `Additional Context: ${moduleContext}` : ''}

Please provide:
1. Clear, educational answers focused on commercial lending and finance
2. Practical examples when helpful
3. Step-by-step explanations for complex concepts
4. References to industry best practices
5. Guidance on how this applies to real-world scenarios

Keep answers comprehensive but focused on the student's specific question about the module content.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sanitizedQuestion }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      answer,
      moduleTitle,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Sanitize error messages - don't expose internal details
    return new Response(JSON.stringify({ 
      error: 'Unable to process your question at this time. Please try again.',
      details: 'Service temporarily unavailable'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
