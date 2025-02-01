import { useContext, useState, useEffect } from "react";
import {
  Save,
  PenSquare,
  Lock,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import TaskActions from "@/components/TaskActions";

const Notes = () => {
  const navigate = useNavigate();
  const { notes, fetchNotes, addNote, updateNote, deleteNote } =
    useContext(AuthContext);
  const [newNote, setNewNote] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !newNote.trim()) {
      toast({
        title: "Error",
        description: "Title and content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingNote) {
        await updateNote(editingNote.id, {
          title: noteTitle,
          content: newNote,
        });
        toast({ title: "Success", description: "Note updated successfully" });
      } else {
        await addNote(noteTitle, newNote, false);
        toast({ title: "Success", description: "Note added successfully" });
      }

      setNewNote("");
      setNoteTitle("");
      setEditingNote(null);
      setShowAddNote(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNewNote(note.content);
    setShowAddNote(true);
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      toast({ title: "Success", description: "Note deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
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
              onClick={() => navigate("/private-notes")}
            >
              <Lock className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showAddNote && (
          <div className="space-y-4 mb-8">
            <Card className="p-4">
              <h2 className="font-semibold mb-4">
                {editingNote ? "Edit Note" : "Create New Note"}
              </h2>
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
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveNote}
                  disabled={!newNote.trim() || !noteTitle.trim()}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingNote ? "Update Note" : "Save Note"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          {notes && notes.length > 0 ? (
            notes.map((note) => (
              <Card
                key={note.id}
                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
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
                        <ChevronUp
                          className="h-4 w-4 cursor-pointer"
                          onClick={() => toggleNoteExpansion(note.id)}
                        />
                      ) : (
                        <ChevronDown
                          className="h-4 w-4 cursor-pointer"
                          onClick={() => toggleNoteExpansion(note.id)}
                        />
                      )}
                      <TaskActions
                        onEdit={() => handleEditNote(note)}
                        onDelete={() => handleDeleteNote(note.id)}
                      />
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
            <p className="text-center text-gray-500">
              No public notes yet. Create your first note!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Notes;
