"use client";

import { cn } from "@/lib/utils";
import type { Task } from "@/hooks/timer/shared";

const STATUS_DOT: Record<string, string> = {
  todo: "bg-foreground/30",
  "in-progress": "bg-blue-500",
  done: "bg-green-500",
};

interface BoardTaskCardContentProps {
  task: Task;
  className?: string;
}

export function BoardTaskCardContent({
  task,
  className,
}: BoardTaskCardContentProps) {
  return (
    <div className={cn("flex items-start gap-1.5 flex-1 min-w-0", className)}>
      <span
        className={cn(
          "mt-1.5 w-2 h-2 rounded-full shrink-0",
          STATUS_DOT[task.status] ?? "bg-foreground/30",
        )}
      />

      <div className="min-w-0">
        <p
          className={cn(
            "text-xs font-semibold leading-snug",
            task.status === "done" && "line-through opacity-50",
          )}
        >
          {task.title}
        </p>
        {task.note && (
          <p className="text-[10px] text-background/50 mt-0.5 truncate">
            {task.note}
          </p>
        )}
      </div>
    </div>
  );
}
