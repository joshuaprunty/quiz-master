import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BsThreeDots } from 'react-icons/bs';
import { RiSparkling2Fill } from "react-icons/ri";
import { FaRegTrashAlt, FaRegEdit } from "react-icons/fa";

export default function QuestionActions({
  index,
  loadingStates,
  onRegenerateQuestion,
  onEditClick,
  onDeleteQuestion,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0"
        >
          <BsThreeDots className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onRegenerateQuestion(index)}
          disabled={loadingStates[index]}
          className="flex items-center"
        >
          <RiSparkling2Fill className="w-4 h-4 mr-2" />
          <span>{loadingStates[index] ? "Regenerating..." : "Regenerate"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onEditClick(index)}
          className="flex items-center"
        >
          <FaRegEdit className="w-4 h-4 mr-2" />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDeleteQuestion(index)}
          className="flex items-center text-red-600"
        >
          <FaRegTrashAlt className="w-4 h-4 mr-2" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}