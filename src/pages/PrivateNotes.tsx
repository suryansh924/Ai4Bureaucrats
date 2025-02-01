import { useContext, useState, useEffect } from "react";
import { Lock, Unlock, Save, PenSquare, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateAIText } from "@/utils/aiWriter";
import AuthContext from "../context/AuthContext";

const PASSWORD_KEY = "private_notes_password";

const PrivateNotes = () => {
  const { privateNotes, addPrivateNote } = useContext(AuthContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [newNote, setNewNote] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedPassword = localStorage.getItem(PASSWORD_KEY);
    const lastAuthStatus = storedPassword && storedPassword === password;
    setIsAuthenticated(lastAuthStatus);
  }, []);

  const handlePasswordSubmit = () => {
    const storedPassword = localStorage.getItem(PASSWORD_KEY);
    if (password === storedPassword) {
      setIsAuthenticated(true);
    } else {
      toast({
        title: "Incorrect Password",
        description: "Please check your password and try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSet = () => {
    localStorage.setItem(PASSWORD_KEY, password);
    setIsSettingPassword(false);
    setIsAuthenticated(true);
    toast({
      title: "Password Set Successfully",
      description: "You can now use this password to access private notes.",
    });
  };

  const handleNewNote = () => {
    if (newNote.trim() && noteTitle.trim()) {
      addPrivateNote(noteTitle, newNote);
      setNewNote("");
      setNoteTitle("");
      setShowAddNote(false);
      toast({
        title: "Private Note Added",
        description: "Your private note was successfully added.",
      });
    } else {
      toast({
        title: "Invalid Input",
        description: "Please provide a valid title and content for the note.",
        variant: "destructive",
      });
    }
  };

  const handleAIWriter = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const generatedContent = await generateAIText(aiPrompt);
      setNewNote(generatedContent);
      setNoteTitle(aiPrompt);
      toast({
        title: "Content Generated",
        description: "AI has generated your content",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate content with AI",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setAiPrompt("");
    }
  };

  const toggleNoteExpansion = (noteId) => {
    setExpandedNoteId(expandedNoteId === noteId ? null : noteId);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <Card className="p-6">
          <h1 className="text-xl font-semibold text-center mb-6">Private Notes</h1>
          <div className="space-y-4">
            <h2 className="font-semibold">Enter Password to View Private Notes</h2>
            {isSettingPassword ? (
              <>
                <Input
                  type="password"
                  placeholder="Set password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handlePasswordSet} className="w-full">
                  Set Password
                </Button>
              </>
            ) : (
              <>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handlePasswordSubmit} className="w-full">
                  Submit
                </Button>
                <Button 
                  onClick={() => setIsSettingPassword(true)} 
                  variant="outline"
                  className="w-full"
                >
                  Set New Password
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Private Notes</h1>
          <Button
            variant="outline"
            onClick={() => setShowAddNote(!showAddNote)}
          >
            {showAddNote ? "Hide Editor" : "Add New Note"}
          </Button>
        </div>

        {showAddNote && (
          <div className="space-y-4 mb-8">
            <Card className="p-4">
              <h2 className="font-semibold mb-4">Create New Note</h2>
              <Input
                type="text"
                placeholder="Enter note title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="mb-2"
              />
              <Textarea
                placeholder="Enter note content"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[200px] mb-2"
              />
              <div className="space-y-2">
                <Input
                  placeholder="Enter prompt for AI generation..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAIWriter}
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
                    onClick={handleNewNote}
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
          {privateNotes && privateNotes.length > 0 ? (
            privateNotes.map((note) => (
              <Card 
                key={note.id} 
                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => toggleNoteExpansion(note.id)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{note.title}</h3>
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
            <p className="text-center text-gray-500">No private notes yet. Create your first note!</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PrivateNotes;