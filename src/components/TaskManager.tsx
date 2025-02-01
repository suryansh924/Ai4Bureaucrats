import { useState, useEffect, useContext } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import TaskActions from "./TaskActions";
import EditTaskDialog from "./EditTaskDialog";
import AuthContext from "../context/AuthContext";

const TaskManager = () => {
  const [editingTask, setEditingTask] = useState(null);
  const { tasks, fetchTasks, toggleTaskCompletion, deleteTask, updateTask } =
    useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <Card className="p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/calendar")}
        >
          <Calendar className="h-4 w-4" />
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
              onChange={() => toggleTaskCompletion(task.id)}
              className="h-4 w-4"
            />
            <span
              className={`flex-1 ${
                task.completed ? "line-through text-gray-400" : ""
              }`}
            >
              {task.title}
            </span>
            <TaskActions
              onEdit={() => setEditingTask(task)}
              onDelete={() => deleteTask(task.id)}
            />
          </div>
        ))}
      </div>

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(updatedTask) => {
            updateTask(editingTask.id, updatedTask);
            setEditingTask(null);
            toast({
              title: "Task Updated",
              description: "Your task has been updated successfully.",
            });
          }}
        />
      )}
    </Card>
  );
};

export default TaskManager;
