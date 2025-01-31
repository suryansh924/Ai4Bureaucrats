import { useState, useEffect, useCallback } from "react";
import { Mic, Square, Save, Check, Loader2, Lock, Play, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateSpeech } from "@/utils/textToSpeech";
import { generateAIText } from "@/utils/aiWriter";

interface Note {
  id: string;
  text: string;
  isPrivate: boolean;
  password?: string;
}

const VoiceDictation = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [correctedTranscript, setCorrectedTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedNotes, setSavedNotes] = useState<Note[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [notePassword, setNotePassword] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
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
    try {
      const corrected = await generateAIText(`Please correct the grammar and improve the writing style of the following text, while maintaining its original meaning: "${transcript}"`);
      if (corrected) {
        setCorrectedTranscript(corrected);
        toast({
          title: "Grammar Corrected",
          description: "Your text has been processed",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to correct grammar",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIContent = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateAIText(aiPrompt);
      if (generated) {
        setTranscript(generated);
        toast({
          title: "Content Generated",
          description: "AI has generated your content",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const playText = async (text: string) => {
    const audioUrl = await generateSpeech(text);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const saveNote = () => {
    const textToSave = correctedTranscript || transcript;
    const newNote: Note = {
      id: Date.now().toString(),
      text: textToSave,
      isPrivate,
      ...(isPrivate && notePassword ? { password: notePassword } : {}),
    };
    setSavedNotes([...savedNotes, newNote]);
    setTranscript("");
    setCorrectedTranscript("");
    setIsPrivate(false);
    setNotePassword("");
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

        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Enter topic or prompt for AI generation..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={generateAIContent}
              disabled={isGenerating || !aiPrompt}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <PenSquare className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>

          <Textarea
            className="min-h-[200px] text-lg leading-relaxed bg-gray-50"
            placeholder="Start speaking or type here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
        </div>

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
            <Button onClick={() => playText(transcript)}>
              <Play className="mr-2 h-4 w-4" />
              Play Text
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
              <div className="mt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playText(correctedTranscript)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Play Corrected
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="private" className="text-sm text-gray-600">
              Private Note
            </label>
          </div>
          {isPrivate && (
            <Input
              type="password"
              placeholder="Enter password to protect note"
              value={notePassword}
              onChange={(e) => setNotePassword(e.target.value)}
              className="max-w-xs"
            />
          )}
        </div>

        {savedNotes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Saved Notes
            </h3>
            <div className="space-y-2">
              {savedNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-gray-50 rounded-md text-gray-800 hover:bg-gray-100 transition-colors relative"
                >
                  {note.isPrivate && (
                    <Lock className="absolute top-4 right-4 h-4 w-4 text-gray-400" />
                  )}
                  <p>{note.text}</p>
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => playText(note.text)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </Button>
                  </div>
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