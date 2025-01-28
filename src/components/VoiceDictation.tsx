import { useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const VoiceDictation = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { toast } = useToast();

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording stopped" : "Recording started",
      description: isRecording ? "Your dictation has been saved" : "Speak clearly into the microphone",
    });
  };

  return (
    <Card className="p-4 animate-fade-in">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Voice Dictation</h2>
          <Button
            onClick={toggleRecording}
            variant={isRecording ? "destructive" : "default"}
            size="icon"
          >
            {isRecording ? (
              <Square className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </div>
        <textarea
          className="w-full h-32 p-2 border rounded-md"
          placeholder="Your dictation will appear here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
      </div>
    </Card>
  );
};

export default VoiceDictation;