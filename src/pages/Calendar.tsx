import { useState, useEffect, useContext } from "react";
import { Calendar as CalendarIcon, Plus, Bell, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TaskActions from "@/components/TaskActions";
import EditTaskDialog from "@/components/EditTaskDialog";
import TaskManager from "@/components/TaskManager"; 
import AuthContext from "../context/AuthContext"; 

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [newTask, setNewTask] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const { tasks, addTask, fetchTasks } = useContext(AuthContext);

  useEffect(() => {
    fetchTasks(); 
  }, []);

  const handleAddTask = async (title: string = newTask) => {
    if (!title.trim() || !date) return;
    try {
      await addTask(title, newTaskDescription, date.toISOString(), newTaskTime);
      toast({
        title: "Task Added",
        description: `Task "${title}" added for ${format(date, "PPP")}`,
      });
      setNewTask("");
      setNewTaskDescription("");
      setNewTaskTime("");
      setIsAddTaskOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendar & Tasks</h1>
          <div className="flex space-x-2">
            <Button
              onClick={() => Notification.requestPermission()}
              variant="outline"
              size="icon"
            >
              <Bell className="h-4 w-4" />
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
            <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
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
                    <Button onClick={() => handleAddTask()} variant="outline">
                      Add Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <TaskManager />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Calendar;
