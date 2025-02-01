import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const TaskActions = ({ onEdit, onDelete }: TaskActionsProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="hover:bg-gray-100 p-1 rounded-full">
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onEdit()}>
        <Edit2 className="h-4 w-4 mr-2" />
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onDelete()} className="text-red-600">
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default TaskActions;
