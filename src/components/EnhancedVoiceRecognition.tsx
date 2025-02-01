import React, { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const API_KEY = "AIzaSyDfVZmPBLiex7cPwtYiyg45yJjy2V2jhNg"; // Replace with actual API key
const API_URL = "https://speech.googleapis.com/v1/speech:recognize";

const EnhancedVoiceRecognition = ({ onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      setError("");

      // Request microphone access (Remove sampleRate, as WebM Opus only supports 48000Hz)
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // Force mono recording
        },
      });

      mediaRecorder.current = new MediaRecorder(streamRef.current, {
        mimeType: "audio/webm;codecs=opus",
      });
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        setIsLoading(true);
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const audioBase64 = await convertBlobToBase64(audioBlob);

        // Stop microphone stream
        streamRef.current?.getTracks().forEach((track) => track.stop());

        const requestBody = {
          config: {
            encoding: "WEBM_OPUS", // Correct encoding for WebM Opus format
            sampleRateHertz: 48000, // Match WebM Opus sample rate
            audioChannelCount: 1, // Use mono recording
            languageCode: "en-US",
          },
          audio: {
            content: audioBase64,
          },
        };

        try {
          const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          const data = await response.json();
          if (data.results) {
            onTranscriptionComplete(data.results[0].alternatives[0].transcript);
          } else {
            throw new Error("Speech-to-text conversion failed.");
          }
        } catch (err) {
          setError("Failed to convert speech to text. Please try again.");
          toast({
            title: "Error",
            description: "Speech-to-text conversion failed.",
            variant: "destructive",
          });
        }

        setIsLoading(false);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      setError(
        "Microphone access denied. Please enable microphone permissions."
      );
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use this feature.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = reject;
    });
  };

  return (
    <div className="flex items-center space-x-4">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        variant={isRecording ? "destructive" : "default"}
        className="w-32"
      >
        {isRecording ? (
          <>
            <MicOff className="mr-2 h-4 w-4" /> Stop
          </>
        ) : (
          <>
            <Mic className="mr-2 h-4 w-4" /> Record
          </>
        )}
      </Button>
    </div>
  );
};

export default EnhancedVoiceRecognition;
