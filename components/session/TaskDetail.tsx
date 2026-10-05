"use client";

import { Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatusDot, STATUS_META } from "./BoardTaskCardContent";
import type { Task, TaskStatus } from "@/hooks/timer/shared";

interface TaskDetailProps {
  task: Task;
  sessionName: string;
  onStatus: (status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function TaskDetail({
  task,
  sessionName,
  onStatus,
  onEdit,
  onDelete,
  onClose,
}: TaskDetailProps) {
  return (
    <aside className="sticky top-24 hidden w-[320px] shrink-0 flex-col self-start rounded-xl border bg-card text-card-foreground xl:flex">
      <div className="flex items-center justify-between border-b px-5 py-3 text-xs text-muted-foreground">
        <span>
          In <span className="font-semibold text-foreground">{sessionName}</span>
        </span>
        <button
          onClick={onClose}
          aria-label="Close details"
          className="rounded-md p-1 hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-6 p-5">
        <h2 className="text-xl font-bold leading-tight break-words">{task.title}</h2>

        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Status
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(STATUS_META) as TaskStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => onStatus(s)}
                aria-pressed={task.status === s}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                  task.status === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <StatusDot status={s} className="size-1.5" />
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Note
          </h3>
          <p
            className={cn(
              "text-sm leading-relaxed whitespace-pre-wrap break-words",
              !task.note && "text-muted-foreground italic",
            )}
          >
            {task.note || "No note added."}
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-t p-4">
        <Button variant="outline" className="flex-1" onClick={onEdit}>
          <Pencil /> Edit
        </Button>
        <Button variant="ghost" className="text-destructive" onClick={onDelete}>
          <Trash2 /> Delete
        </Button>
      </div>
    </aside>
  );
}
