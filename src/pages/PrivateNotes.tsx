import { useState } from "react";
import { Lock, Unlock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface PrivateNote {
  id: string;
  text: string;
  createdAt: Date;
}

const PrivateNotes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState<PrivateNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const { toast } = useToast();

  const authenticate = () => {
    // In a real app, this would validate against a stored password
    if (password === "your-secure-password") {
      setIsAuthenticated(true);
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

  const saveNote = () => {
    if (!newNote.trim()) return;

    const note: PrivateNote = {
      id: Date.now().toString(),
      text: newNote,
      createdAt: new Date(),
    };

    setNotes([note, ...notes]);
    setNewNote("");
    toast({
      title: "Note Saved",
      description: "Your private note has been saved",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 max-w-md animate-fade-in">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Lock className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-center">Private Notes</h1>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && authenticate()}
            />
            <Button onClick={authenticate} className="w-full">
              Unlock
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
          <Button
            variant="outline"
            onClick={() => setIsAuthenticated(false)}
            size="icon"
          >
            <Unlock className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="Write your private note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[200px]"
          />
          <Button onClick={saveNote} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Note
          </Button>

          <div className="space-y-4 mt-8">
            {notes.map((note) => (
              <Card key={note.id} className="p-4">
                <p className="whitespace-pre-wrap">{note.text}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PrivateNotes;