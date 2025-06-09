
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithAI(message: string, conversationHistory: Message[] = []): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('chat-with-ai', {
      body: { 
        message,
        conversationHistory 
      }
    });

    if (error) {
      throw error;
    }

    return data.response || 'Sorry, I couldn\'t generate a response.';
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}
