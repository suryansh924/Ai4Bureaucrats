import { useState } from "react";
import { Calendar as CalendarIcon, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  reminder?: boolean;
}

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const { toast } = useToast();

  const addTask = () => {
    if (!newTask.trim() || !date) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      date: date,
      completed: false,
      reminder: true,
    };

    setTasks([...tasks, task]);
    setNewTask("");

    toast({
      title: "Task Added",
      description: `Task scheduled for ${format(date, "PPP")}`,
    });

    // Schedule notification
    if (task.reminder) {
      const notification = new Notification("Task Reminder", {
        body: task.title,
        icon: "/favicon.ico",
      });
    }
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
          <Button onClick={requestNotificationPermission} variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
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
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTask()}
              />
              <Button onClick={addTask} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {tasks
                .filter((task) => date && task.date.toDateString() === date.toDateString())
                .map((task) => (
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
                    {task.reminder && <Bell className="h-4 w-4 text-gray-400" />}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Calendar;