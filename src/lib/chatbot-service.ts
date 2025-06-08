
import { supabase } from '@/integrations/supabase/client';

export async function chatWithAI(message: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('chat-with-ai', {
      body: { message }
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
