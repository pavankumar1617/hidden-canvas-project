
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a helpful assistant for Stegano, a steganography web application that helps users hide secret messages inside images. 

Key features of the app:
- Hide messages: Users can upload an image, enter a secret message and password, then download an image with the hidden message
- Reveal messages: Users can upload an image with hidden content and extract the message using the correct password
- The app uses AES encryption and LSB steganography techniques
- Users need to verify their email before using the app
- Protected routes require authentication

Common user questions and helpful responses:
- How to hide a message: Upload image → Enter message and password → Click "Hide Message" → Download the result
- How to reveal a message: Upload the image → Enter the password → Click "Reveal Message"
- Troubleshooting: Make sure the image is large enough, use the correct password, ensure the image hasn't been compressed
- Email verification: Check spam folder, wait a few minutes, contact support if issues persist
- Security: Use strong passwords, don't share the password with untrusted parties

Keep responses helpful, friendly, and concise. Focus on practical guidance for using the app. You can maintain context from previous messages in the conversation.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
