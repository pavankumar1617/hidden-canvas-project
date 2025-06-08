
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

Keep responses helpful, friendly, and concise. Focus on practical guidance for using the app.`;

export async function chatWithAI(message: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}
