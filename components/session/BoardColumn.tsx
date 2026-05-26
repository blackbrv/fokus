"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { BoardTaskCard } from "./BoardTaskCard";
import { BoardTaskCardContent } from "./BoardTaskCardContent";
import type { Task, TaskStatus } from "@/hooks/timer/shared";

interface BoardColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onOpenAdd: (status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  aosDelay?: number;
}

export function BoardColumn({
  status,
  label,
  tasks,
  onOpenAdd,
  onEdit,
  onDelete,
  aosDelay = 0,
}: BoardColumnProps) {
  return (
    <div
      className="flex flex-col rounded-xl bg-foreground/[0.03] border border-foreground/10 min-w-[220px] max-w-[280px] flex-1"
      data-aos="fade-up"
      data-aos-duration="500"
      data-aos-delay={aosDelay}
      data-aos-offset="0"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-xs font-semibold text-foreground/30 bg-foreground/5 px-1.5 py-0.5 rounded-full">
          {tasks.length}
        </span>
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
              className="flex items-start gap-1.5 px-2.5 py-2 rounded-lg bg-foreground text-background shadow-xl opacity-90 cursor-grabbing"
            >
              {task && <BoardTaskCardContent task={task} />}
            </div>
          );
        }}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-col gap-1.5 px-2 pb-2 min-h-[60px] flex-1"
          >
            {tasks.map((task, index) => (
              <BoardTaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Footer: open add dialog */}
      <div className="px-2 pb-2">
        <button
          onClick={() => onOpenAdd(status)}
          className="w-full flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-xs font-semibold text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
        >
          <Plus size={13} />
          Add task
        </button>
      </div>
    </div>
  );
}
