import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy for security
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIService {
  private systemPrompt = `You are a helpful AI assistant for a Business Finance course. You help students understand financial concepts, answer questions about business finance topics, and provide clear explanations with practical examples. 

Key areas you can help with:
- Financial analysis and planning
- Business loans and SBA programs
- Cash flow management
- Investment strategies
- Risk assessment
- Financial statements and reporting
- Business valuation
- Credit analysis

Always provide accurate, educational responses that are appropriate for business finance students. Use clear language and provide practical examples when helpful. If you're unsure about something, be honest and suggest consulting with course materials or instructors.`;

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      // Add system prompt if not already present
      const messagesWithSystem = messages[0]?.role === 'system' 
        ? messages 
        : [{ role: 'system' as const, content: this.systemPrompt }, ...messages];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messagesWithSystem,
        max_tokens: 1000,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('OpenAI API key is not configured properly. Please contact support.');
        }
        if (error.message.includes('quota')) {
          throw new Error('API usage limit reached. Please try again later.');
        }
      }
      
      throw new Error('Failed to get response from AI assistant. Please try again.');
    }
  }

  async sendQuickQuestion(question: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'user', content: question }
    ];
    
    return this.sendMessage(messages);
  }
}

export const openaiService = new OpenAIService();