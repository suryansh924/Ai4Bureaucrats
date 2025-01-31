import { useState, useEffect, useCallback } from "react";
import { Mic, Square, Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const VoiceDictation = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [correctedTranscript, setCorrectedTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const { toast } = useToast();

  const recognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      return recognition;
    }
    return null;
  }, []);

  useEffect(() => {
    const speechRecognition = recognition();
    if (!speechRecognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    speechRecognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript((prev) => prev + transcript);
    };

    if (isRecording) {
      speechRecognition.start();
    } else {
      speechRecognition.stop();
    }

    return () => {
      speechRecognition.stop();
    };
  }, [isRecording, recognition, toast]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      toast({
        title: "Recording stopped",
        description: "Your dictation has been saved",
      });
    } else {
      setTranscript("");
      setCorrectedTranscript("");
      toast({
        title: "Recording started",
        description: "Speak clearly into the microphone",
      });
    }
  };

  const correctGrammar = async () => {
    setIsProcessing(true);
    // Simulated grammar correction - replace with actual API call
    setTimeout(() => {
      setCorrectedTranscript(transcript);
      setIsProcessing(false);
      toast({
        title: "Grammar Corrected",
        description: "Your text has been processed",
      });
    }, 1500);
  };

  const saveNote = () => {
    const textToSave = correctedTranscript || transcript;
    setSavedNotes([...savedNotes, textToSave]);
    setTranscript("");
    setCorrectedTranscript("");
    toast({
      title: "Note Saved",
      description: "Your note has been saved successfully",
    });
  };

  return (
    <Card className="p-6 animate-fade-in bg-white shadow-lg">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Voice Assistant</h2>
          <div className="flex gap-2">
            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "default"}
              size="icon"
              className={cn(
                "transition-all duration-300",
                isRecording && "animate-pulse"
              )}
            >
              {isRecording ? (
                <Square className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Textarea
          className="min-h-[200px] text-lg leading-relaxed bg-gray-50"
          placeholder="Start speaking or type here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />

        {transcript && (
          <div className="flex gap-2 justify-end">
            <Button
              onClick={correctGrammar}
              variant="outline"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Correct Grammar
                </>
              )}
            </Button>
            <Button onClick={saveNote}>
              <Save className="mr-2 h-4 w-4" />
              Save Note
            </Button>
          </div>
        )}

        {correctedTranscript && (
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Corrected Text
            </h3>
            <div className="p-4 bg-gray-50 rounded-md text-gray-800">
              {correctedTranscript}
            </div>
          </div>
        )}

        {savedNotes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Saved Notes
            </h3>
            <div className="space-y-2">
              {savedNotes.map((note, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-md text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VoiceDictation;