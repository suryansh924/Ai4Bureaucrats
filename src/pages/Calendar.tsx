import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Bell, Mic, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Task {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  reminder?: boolean;
  description?: string;
  time?: string;
}

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const recognition = typeof window !== "undefined" 
    ? new (window as any).webkitSpeechRecognition()
    : null;

  useEffect(() => {
    if (recognition) {
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("");

        if (transcript.toLowerCase().includes("schedule meeting")) {
          const title = transcript.toLowerCase().replace("schedule meeting", "").trim();
          addTask(title, true);
        } else if (transcript.toLowerCase().includes("add task")) {
          const title = transcript.toLowerCase().replace("add task", "").trim();
          addTask(title);
        }
      };
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Error",
        description: "Speech recognition is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  const addTask = (title: string = newTask, isMeeting: boolean = false) => {
    if (!title.trim() || !date) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title,
      date: date,
      completed: false,
      reminder: true,
      description: newTaskDescription,
      time: newTaskTime || (isMeeting ? "09:00" : undefined),
    };

    setTasks([...tasks, task]);
    setNewTask("");
    setNewTaskDescription("");
    setNewTaskTime("");

    // Schedule notification
    if (task.reminder) {
      const notificationTime = new Date(task.date);
      if (task.time) {
        const [hours, minutes] = task.time.split(":");
        notificationTime.setHours(parseInt(hours), parseInt(minutes));
      }

      if (Notification.permission === "granted") {
        const notification = new Notification("Task Reminder", {
          body: task.title,
          icon: "/favicon.ico",
        });
      }
    }

    toast({
      title: isMeeting ? "Meeting Scheduled" : "Task Added",
      description: `${isMeeting ? "Meeting" : "Task"} scheduled for ${format(date, "PPP")}${task.time ? ` at ${task.time}` : ""}`,
    });
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      toast({
        title: "Notifications Enabled",
        description: "You will receive reminders for your tasks",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendar & Tasks</h1>
          <div className="flex space-x-2">
            <Button onClick={requestNotificationPermission} variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={toggleListening}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task or Meeting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task or Meeting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input
                    placeholder="Title..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button onClick={() => addTask()} variant="outline">
                      Add as Task
                    </Button>
                    <Button onClick={() => addTask(newTask, true)}>
                      Schedule Meeting
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="space-y-2">
              {tasks
                .filter((task) => date && task.date.toDateString() === date.toDateString())
                .sort((a, b) => (a.time && b.time ? a.time.localeCompare(b.time) : 0))
                .map((task) => (
                  <Card key={task.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${task.completed ? "line-through text-gray-400" : ""}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-sm text-gray-500">{task.description}</div>
                        )}
                        {task.time && (
                          <div className="text-sm text-gray-500">{task.time}</div>
                        )}
                      </div>
                      {task.reminder && <Bell className="h-4 w-4 text-gray-400" />}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Calendar;