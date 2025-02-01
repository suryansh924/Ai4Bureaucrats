import { useContext, useState } from "react";
import { Save, PenSquare, Lock, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateAIText } from "@/utils/aiWriter";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Notes = () => {
  const navigate = useNavigate();
  const { publicNotes, addPublicNote } = useContext(AuthContext);
  const [newNote, setNewNote] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const { toast } = useToast();

  const generateContent = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const generated = await generateAIText(aiPrompt);
      if (generated) {
        setNewNote(generated);
        setNoteTitle(aiPrompt);
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
      setAiPrompt("");
    }
  };

  const handleSaveNote = () => {
    if (!newNote.trim() || !noteTitle.trim()) {
      toast({
        title: "Error",
        description: "Note title and content cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    addPublicNote(noteTitle, newNote);
    setNewNote("");
    setNoteTitle("");
    setShowAddNote(false);
    toast({
      title: "Success",
      description: "Note saved successfully",
    });
  };

  const toggleNoteExpansion = (noteId) => {
    setExpandedNoteId(expandedNoteId === noteId ? null : noteId);
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Public Notes</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddNote(!showAddNote)}
            >
              {showAddNote ? "Hide Editor" : "Add New Note"}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/private-notes')}
            >
              <Lock className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showAddNote && (
          <div className="space-y-4 mb-8">
            <Card className="p-4">
              <h2 className="font-semibold mb-4">Create New Note</h2>
              <Input
                placeholder="Note Title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="mb-2"
              />
              <Textarea
                placeholder="Write your note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[200px] mb-2"
              />
              <div className="space-y-2">
                <Input
                  placeholder="Enter topic or prompt for AI generation..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={generateContent}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <PenSquare className="mr-2 h-4 w-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleSaveNote} 
                    disabled={!newNote.trim() || !noteTitle.trim()}
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Note
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          {publicNotes && publicNotes.length > 0 ? (
            publicNotes.map((note) => (
              <Card 
                key={note.id} 
                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => toggleNoteExpansion(note.id)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">
                      {note.title || "Untitled Note"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                      {expandedNoteId === note.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  {expandedNoteId === note.id && (
                    <div className="mt-4">
                      <p className="whitespace-pre-wrap">{note.content}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500">No public notes yet. Create your first note!</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Notes;