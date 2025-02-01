import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  description?: string;
  time?: string;
}

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onSave: (updatedTask: Partial<Task>) => void;
}

const EditTaskDialog = ({
  task,
  open,
  onClose,
  onSave,
}: EditTaskDialogProps) => {
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(
    task.description || ""
  );
  const [editedTime, setEditedTime] = useState(task.time || "");

  const handleSave = () => {
    onSave({
      title: editedTitle,
      description: editedDescription,
      time: editedTime,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Input
            placeholder="Title..."
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
          />
          <Input
            type="time"
            value={editedTime}
            onChange={(e) => setEditedTime(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
