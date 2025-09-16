import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { question, moduleTitle, moduleContext } = await req.json();
    
    if (!question) {
      throw new Error('Question is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Processing question for module: ${moduleTitle}`);
    console.log(`Question: ${question}`);

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
          { role: 'user', content: question }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    console.log('Generated answer successfully');

    return new Response(JSON.stringify({ 
      answer,
      moduleTitle,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ask-question function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to process question with ChatGPT'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});