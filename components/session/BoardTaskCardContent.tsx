"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTaskTime, type Task, type TaskStatus } from "@/hooks/timer/shared";

export const STATUS_META: Record<TaskStatus, { label: string; dot: string }> = {
  todo: { label: "To Do", dot: "bg-muted-foreground" },
  "in-progress": { label: "In Progress", dot: "bg-chart-1" },
  done: { label: "Done", dot: "bg-chart-2" },
};

export function StatusDot({ status, className }: { status: TaskStatus; className?: string }) {
  return <span className={cn("size-2 shrink-0 rounded-full", STATUS_META[status].dot, className)} />;
}

// Colors are inherited so the content reads on both plain and selected cards.
export function BoardTaskCardContent({ task }: { task: Task }) {
  return (
    <div className="min-w-0 flex-1">
      <p
        className={cn(
          "pr-12 text-sm font-semibold leading-snug break-words",
          task.status === "done" && "line-through opacity-60",
        )}
      >
        {task.title}
      </p>
      {task.note && <p className="mt-1 line-clamp-2 text-xs opacity-60">{task.note}</p>}
      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-70">
        <StatusDot status={task.status} className="size-1.5" />
        {STATUS_META[task.status].label}
        {task.createdAt && (
          <time
            dateTime={new Date(task.createdAt).toISOString()}
            title="Created"
            className="ml-auto flex items-center gap-1 font-medium normal-case tracking-normal"
          >
            <Clock className="size-3" />
            {formatTaskTime(task.createdAt)}
          </time>
        )}
      </div>
    </div>
  );
}
