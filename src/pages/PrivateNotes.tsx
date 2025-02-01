import { useContext, useState, useEffect } from "react";
import { Lock, Unlock, Save, PenSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateAIText } from "@/utils/aiWriter";
import AuthContext from "../context/AuthContext";

interface PrivateNote {
  id: string;
  text: string;
  createdAt: Date;
  title?: string;
}

const PASSWORD_KEY = "private_notes_password";

const PrivateNotes = () => {
  const { notes, addNote } = useContext(AuthContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [newNote, setNewNote] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedPassword = localStorage.getItem(PASSWORD_KEY);
    const lastAuth = localStorage.getItem("lastAuth");
    if (
      storedPassword &&
      lastAuth &&
      Date.now() - parseInt(lastAuth) < 30 * 60 * 1000
    ) {
      setIsAuthenticated(true);
    } else if (!storedPassword) {
      setIsSettingPassword(true);
    }
  }, []);

  const setInitialPassword = () => {
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem(PASSWORD_KEY, password);
    setIsAuthenticated(true);
    setIsSettingPassword(false);
    localStorage.setItem("lastAuth", Date.now().toString());
    toast({
      title: "Password Set",
      description: "Your password has been set successfully",
    });
  };

  const authenticate = () => {
    const storedPassword = localStorage.getItem(PASSWORD_KEY);
    if (password === storedPassword) {
      setIsAuthenticated(true);
      localStorage.setItem("lastAuth", Date.now().toString());
      toast({
        title: "Authenticated",
        description: "Welcome to your private notes",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("lastAuth");
    toast({
      title: "Logged Out",
      description: "Your session has been ended",
    });
  };

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

  if (isSettingPassword) {
    return (
      <div className="container mx-auto p-4 max-w-md animate-fade-in">
        <Card className="p-6">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-center">Set Password</h1>
            <Input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={setInitialPassword} className="w-full">
              Set Password
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Private Notes</h1>
          <Button variant="outline" onClick={logout} size="icon">
            <Unlock className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Enter topic or prompt for AI generation..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
          <Button
            onClick={generateContent}
            disabled={isGenerating || !aiPrompt}
          >
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
          <Textarea
            placeholder="Write your private note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <Button onClick={() => addNote(noteTitle, newNote)}>
            <Save className="mr-2 h-4 w-4" />
            Save Note
          </Button>
          <div className="space-y-4 mt-8">
            {notes.map((note) => (
              <Card key={note.id} className="p-4">
                {note.title && (
                  <h3 className="font-medium mb-2">{note.title}</h3>
                )}
                <p className="whitespace-pre-wrap">{note.content}</p>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PrivateNotes;
