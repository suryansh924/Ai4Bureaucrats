import { useState, useEffect, useCallback, useContext } from "react";
import {
  Mic,
  Square,
  Save,
  Loader2,
  PenSquare,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import TaskActions from "@/components/TaskActions"; // 🚀 Replacing inline edit/delete
import AuthContext from "../context/AuthContext";
import ReactMarkdown from "react-markdown";

import EnhancedVoiceRecognition from "./EnhancedVoiceRecognition";

// ✅ Replace with your Gemini API Key
const GEMINI_API_KEY = "AIzaSyBca0qpaK10qA5pBfIvJ397j4CunPeegQo";

const VoiceDictation = () => {
  const { user, addNote, updateNote, deleteNote, notes } =
    useContext(AuthContext);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 🎤 Speech Recognition Setup
  const recognition = useCallback(() => {
    if ("webkitSpeechRecognition" in window) {
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
      const newTranscript = event.results[event.resultIndex][0].transcript;
      setTranscript((prev) => prev + " " + newTranscript);
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

  // 🎤 Toggle Voice Recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording stopped" : "Recording started",
      description: isRecording
        ? "Your dictation has been saved."
        : "Speak clearly into the microphone.",
    });

    if (!isRecording) {
      setTranscript("");
    }
  };

  // ✅ AI Content Generation using Gemini API
  const generateAIContent = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Enter a topic for AI generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Write about: ${aiPrompt}. Make it professional and structured.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
          }),
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const generatedText = data.candidates[0].content.parts[0].text;
      setTranscript(generatedText.trim());

      toast({
        title: "AI Content Generated",
        description: "Text successfully generated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to generate content. ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setAiPrompt("");
    }
  };

  // 💾 Save Notes to Backend
  const saveNote = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Error",
        description: "Cannot save an empty note.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addNote("Voice Note", transcript, false);
      setTranscript("");
      toast({
        title: "Note Saved",
        description: "Your note has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note.",
        variant: "destructive",
      });
    }
  };

  // 📝 Edit Note Inline
  const editNote = (note) => {
    setSelectedNote(note);
    setTranscript(note.content);
    setIsEditing(true);
  };

  // ✅ Update Note in Backend
  const handleUpdateNote = async () => {
    if (!selectedNote) return;
    if (!transcript.trim()) {
      handleDeleteNote(selectedNote.id);
      return;
    }

    try {
      await updateNote(selectedNote.id, { content: transcript });
      setSelectedNote(null);
      setIsEditing(false);
      setTranscript("");
      toast({
        title: "Note Updated",
        description: "Your note has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note.",
        variant: "destructive",
      });
    }
  };

  // ❌ Delete Note from Backend
  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      toast({
        title: "Note Deleted",
        description: "Your note has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 bg-white shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Voice & AI Assistant
      </h2>

      <div className="space-y-4">
        {/* 🎤 Voice Recording & AI Prompt */}
        <div className="flex gap-4">
          <EnhancedVoiceRecognition
            onTranscriptionComplete={(enhancedText) =>
              setTranscript((prev) => prev + " " + enhancedText)
            }
          />
          <Input
            placeholder="Enter topic for AI generation..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={generateAIContent}
            disabled={isGenerating || !aiPrompt.trim()}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PenSquare className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </div>

        {/* 📝 Editable Transcript */}
        <Textarea
          className="min-h-[200px] text-lg leading-relaxed bg-gray-50"
          placeholder="Start speaking or type here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />

        {/* 💾 Save & Update Buttons */}
        <div className="flex justify-end">
          {isEditing ? (
            <Button onClick={handleUpdateNote}>
              <Save className="mr-2 h-4 w-4" />
              Update Note
            </Button>
          ) : (
            <Button onClick={saveNote}>
              <Save className="mr-2 h-4 w-4" />
              Save Note
            </Button>
          )}
        </div>

        {/* 📋 List of Saved Notes */}
        {notes.length > 0 &&
          notes.map((note) => (
            <Card key={note.id} className="p-4">
              <ReactMarkdown className="text-gray-700">
                {note.content}
              </ReactMarkdown>
              <TaskActions
                onEdit={() => editNote(note)}
                onDelete={() => handleDeleteNote(note.id)}
              />
            </Card>
          ))}
      </div>
    </Card>
  );
};

export default VoiceDictation;
