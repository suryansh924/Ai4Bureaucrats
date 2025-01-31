import { useState, useEffect } from "react";
import { Plus, Mic, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  dueDate?: Date;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const recognition = typeof window !== "undefined" 
    ? new (window as any).webkitSpeechRecognition()
    : null;

  if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
  }

  const startListening = () => {
    if (!recognition) {
      toast({
        title: "Error",
        description: "Speech recognition is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (recognition) {
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("");

        // Process voice commands
        if (transcript.toLowerCase().includes("add task")) {
          const taskTitle = transcript.toLowerCase().replace("add task", "").trim();
          addTask(taskTitle);
        } else if (transcript.toLowerCase().includes("open calendar")) {
          navigate("/calendar");
        }
      };
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  const addTask = (title: string = newTask) => {
    if (!title.trim()) return;
    setTasks([...tasks, { id: Date.now(), title, completed: false }]);
    setNewTask("");
    toast({
      title: "Task Added",
      description: `New task: ${title}`,
    });
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <Card className="p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/calendar")}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={isListening ? stopListening : startListening}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Add new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
        />
        <Button onClick={() => addTask()} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="h-4 w-4"
            />
            <span
              className={`flex-1 ${
                task.completed ? "line-through text-gray-400" : ""
              }`}
            >
              {task.title}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TaskManager;