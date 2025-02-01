import { useState, useEffect, useCallback } from "react";
import { Mic, Square, Save, Loader2, PenSquare, MoreVertical, Trash, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateAIText } from "@/utils/aiWriter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface Note {
  id: string;
  text: string;
  correctedText?: string;
  lastEdited?: Date;
}

const VoiceDictation = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [correctedTranscript, setCorrectedTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedNotes, setSavedNotes] = useState<Note[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const recognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      return recognition;
    }
    return null;
  }, []);

  // Automatic grammar correction
  useEffect(() => {
    const debounceTimeout = setTimeout(async () => {
      if (transcript && !isProcessing) {
        setIsProcessing(true);
        try {
          const corrected = await generateAIText(
            `Please correct the grammar and improve the writing style of the following text, while maintaining its original meaning: "${transcript}"`
          );
          if (corrected) {
            setCorrectedTranscript(corrected);
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
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(debounceTimeout);
  }, [transcript, toast]);

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

  const saveNote = () => {
    const textToSave = correctedTranscript || transcript;
    const newNote: Note = {
      id: Date.now().toString(),
      text: textToSave,
      lastEdited: new Date(),
    };
    setSavedNotes([...savedNotes, newNote]);
    setTranscript("");
    setCorrectedTranscript("");
    toast({
      title: "Note Saved",
      description: "Your note has been saved successfully",
    });
  };

  const editNote = (note: Note) => {
    setSelectedNote(note);
    setTranscript(note.text);
    setIsEditDialogOpen(true);
  };

  const updateNote = () => {
    if (selectedNote) {
      const updatedText = correctedTranscript || transcript;
      
      // Check if the note is empty after trimming whitespace
      if (!updatedText.trim()) {
        // Delete the note if it's empty
        setSavedNotes(savedNotes.filter(note => note.id !== selectedNote.id));
        setIsEditDialogOpen(false);
        setSelectedNote(null);
        setTranscript("");
        setCorrectedTranscript("");
        toast({
          title: "Note Deleted",
          description: "Empty note has been removed",
        });
        return;
      }

      // Update the note if it has content
      setSavedNotes(
        savedNotes.map((note) =>
          note.id === selectedNote.id
            ? {
                ...note,
                text: updatedText,
                lastEdited: new Date(),
              }
            : note
        )
      );
      setIsEditDialogOpen(false);
      setSelectedNote(null);
      setTranscript("");
      setCorrectedTranscript("");
      toast({
        title: "Note Updated",
        description: "Your note has been updated successfully",
      });
    }
  };

  const moveToPrivate = async (noteId: string) => {
    const storedPassword = localStorage.getItem('private_notes_password');
    if (!storedPassword) {
      toast({
        title: "Setup Required",
        description: "You need to set up private notes first",
      });
      navigate('/private-notes');
      return;
    }
    
    const noteToMove = savedNotes.find(note => note.id === noteId);
    if (noteToMove) {
      setSavedNotes(savedNotes.filter(note => note.id !== noteId));
      toast({
        title: "Note Moved",
        description: "Note moved to private section",
      });
      navigate('/private-notes');
    }
  };

  const deleteNote = (id: string) => {
    setSavedNotes(savedNotes.filter(note => note.id !== id));
    toast({
      title: "Note Deleted",
      description: "Your note has been deleted",
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
          <div className="flex justify-end">
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
              {savedNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-gray-50 rounded-md text-gray-800 hover:bg-gray-100 transition-colors relative cursor-pointer"
                  onClick={() => editNote(note)}
                >
                  <p className="line-clamp-3">{note.text}</p>
                  {note.lastEdited && (
                    <p className="text-sm text-gray-500 mt-2">
                      Last edited: {note.lastEdited.toLocaleString()}
                    </p>
                  )}
                  <div className="mt-2 flex justify-end gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => moveToPrivate(note.id)}>
                          Move to Private
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteNote(note.id)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Leave the note empty to delete it
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <Textarea
              className="min-h-[300px] text-lg leading-relaxed"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Start typing... (empty note will be deleted)"
            />
            {correctedTranscript && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Corrected Version</h4>
                <p>{correctedTranscript}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateNote}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default VoiceDictation;