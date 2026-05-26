"use client";

import { Draggable } from "@hello-pangea/dnd";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BoardTaskCardContent } from "./BoardTaskCardContent";
import type { Task } from "@/hooks/timer/shared";

interface BoardTaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function BoardTaskCard({ task, index, onEdit, onDelete }: BoardTaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "group flex items-start gap-1.5 px-2.5 py-2 rounded-lg bg-foreground text-background cursor-default",
            snapshot.isDragging && "opacity-80 shadow-lg",
          )}
        >
          <button
            {...provided.dragHandleProps}
            tabIndex={-1}
            aria-label="Drag to reorder"
            className="mt-0.5 cursor-grab active:cursor-grabbing text-background/25 hover:text-background/50 transition-colors touch-none shrink-0"
          >
            <GripVertical size={12} />
          </button>

          <BoardTaskCardContent task={task} />

          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              aria-label="Edit"
              className="p-1 rounded text-background/40 hover:text-background/80 transition-colors cursor-pointer"
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              aria-label="Delete"
              className="p-1 rounded text-background/40 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
