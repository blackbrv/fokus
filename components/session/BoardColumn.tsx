"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BoardTaskCard, CARD_CLASS } from "./BoardTaskCard";
import { BoardTaskCardContent, StatusDot, STATUS_META } from "./BoardTaskCardContent";
import type { Task, TaskStatus } from "@/hooks/timer/shared";

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  selectedId: string | null;
  dragDisabled: boolean;
  onSelect: (task: Task) => void;
  onOpenAdd: (status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  aosDelay?: number;
}

export function BoardColumn({
  status,
  tasks,
  selectedId,
  dragDisabled,
  onSelect,
  onOpenAdd,
  onEdit,
  onDelete,
  aosDelay = 0,
}: BoardColumnProps) {
  return (
    <div
      className="flex min-w-0 flex-col"
      data-aos="fade-up"
      data-aos-duration="500"
      data-aos-delay={aosDelay}
      data-aos-offset="0"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-1 pb-3">
        <StatusDot status={status} />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {STATUS_META[status].label}
        </span>
        <span className="ml-auto text-xs font-semibold text-muted-foreground">
          {tasks.length}
        </span>
        <button
          onClick={() => onOpenAdd(status)}
          aria-label={`Add task to ${STATUS_META[status].label}`}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Task list */}
      <Droppable
        droppableId={status}
        renderClone={(provided, _snapshot, rubric) => {
          const task = tasks.find((t) => t.id === rubric.draggableId);
          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={cn(CARD_CLASS, "bg-card text-card-foreground shadow-xl cursor-grabbing")}
            >
              {task && <BoardTaskCardContent task={task} />}
            </div>
          );
        }}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex min-h-[120px] flex-1 flex-col gap-2 rounded-xl p-1 transition-colors",
              snapshot.isDraggingOver && "bg-muted",
            )}
          >
            {tasks.map((task, index) => (
              <BoardTaskCard
                key={task.id}
                task={task}
                index={index}
                selected={task.id === selectedId}
                dragDisabled={dragDisabled}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <button
                onClick={() => onOpenAdd(status)}
                className="flex h-[88px] items-center justify-center gap-1.5 rounded-xl border border-dashed text-xs font-semibold text-muted-foreground hover:border-ring hover:text-foreground transition-colors cursor-pointer"
              >
                <Plus size={13} /> Add task
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
