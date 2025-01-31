import { toast } from "@/hooks/use-toast";

export const generateSpeech = async (text: string, voiceId: string = "EXAVITQu4vr4xnSDxMaL") => {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      }),
    });

    if (!response.ok) throw new Error('Failed to generate speech');

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.error('Error generating speech:', error);
    toast({
      title: "Error",
      description: "Failed to generate speech. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};