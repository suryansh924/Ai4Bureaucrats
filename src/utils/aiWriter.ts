import { toast } from "@/hooks/use-toast";

export const generateAIText = async (prompt: string) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates high-quality, natural-sounding text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error('Failed to generate text');
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating text:', error);
    toast({
      title: "Error",
      description: "Failed to generate text. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};