"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BoardTaskCardContent } from "./BoardTaskCardContent";
import type { Task } from "@/hooks/timer/shared";

interface BoardTaskCardProps {
  task: Task;
  index: number;
  selected: boolean;
  dragDisabled: boolean;
  onSelect: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const CARD_CLASS =
  "group relative flex rounded-xl border p-3 text-left transition-[background-color,border-color,box-shadow]";

export function BoardTaskCard({
  task,
  index,
  selected,
  dragDisabled,
  onSelect,
  onEdit,
  onDelete,
}: BoardTaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={dragDisabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onSelect(task)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSelect(task);
          }}
          className={cn(
            CARD_CLASS,
            "cursor-pointer",
            selected
              ? "border-primary bg-primary text-primary-foreground shadow-lg"
              : "bg-card text-card-foreground hover:border-ring hover:shadow-sm",
            snapshot.isDragging && "shadow-xl",
          )}
        >
          <BoardTaskCardContent task={task} />

          <div className="absolute top-2 right-2 flex gap-0.5 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              aria-label="Edit"
              className="rounded-md p-1.5 opacity-60 hover:bg-current/10 hover:opacity-100 cursor-pointer"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              aria-label="Delete"
              className="rounded-md p-1.5 opacity-60 hover:bg-current/10 hover:text-destructive hover:opacity-100 cursor-pointer"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
