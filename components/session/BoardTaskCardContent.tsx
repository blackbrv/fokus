"use client";

import { Clock, ImageIcon, Link2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatTaskTime, noteImages, STATUS_LABEL, stripImages, taskLink, type TagColor, type Task, type TaskStatus, type TaskTag } from "@/hooks/timer/shared";

export const STATUS_META: Record<TaskStatus, { label: string; dot: string }> = {
  todo: { label: STATUS_LABEL.todo, dot: "bg-muted-foreground" },
  "in-progress": { label: STATUS_LABEL["in-progress"], dot: "bg-chart-1" },
  done: { label: STATUS_LABEL.done, dot: "bg-chart-2" },
};

export function StatusDot({ status, className }: { status: TaskStatus; className?: string }) {
  return <span className={cn("size-2 shrink-0 rounded-full", STATUS_META[status].dot, className)} />;
}

/** Chip tint per tag color; literal classes so Tailwind keeps them. */
export const TAG_COLOR_CLASS: Record<TagColor, string> = {
  // Solid fills so chips read on light, dark and selected (inverted) cards alike.
  red: "border-transparent bg-red-500 text-white",
  orange: "border-transparent bg-orange-500 text-white",
  yellow: "border-transparent bg-yellow-400 text-yellow-950",
  green: "border-transparent bg-green-600 text-white",
  blue: "border-transparent bg-blue-500 text-white",
  purple: "border-transparent bg-purple-500 text-white",
  pink: "border-transparent bg-pink-500 text-white",
  gray: "border-transparent bg-zinc-500 text-white",
};

/** `key: value` chips for a task's user-defined tags. */
export function TagChips({ tags, className }: { tags?: TaskTag[]; className?: string }) {
  if (!tags?.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1", className)} aria-label="Tags">
      {tags.map((t) => (
        <li
          key={t.key}
          className={cn(
            "max-w-full truncate rounded-md border border-current/20 px-1.5 py-0.5 text-[11px] leading-none",
            t.color && TAG_COLOR_CLASS[t.color],
          )}
        >
          <span className="opacity-70">{t.key}:</span> <span className="font-semibold">{t.value}</span>
        </li>
      ))}
    </ul>
  );
}

// Colors are inherited so the content reads on both plain and selected cards.
export function BoardTaskCardContent({ task }: { task: Task }) {
  const text = stripImages(task.note);
  const images = noteImages(task.note).length;
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
      {text && <p className="mt-1 line-clamp-2 text-xs opacity-60">{text}</p>}
      <TagChips tags={task.tags} className="mt-2" />
      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-70">
        <StatusDot status={task.status} className="size-1.5" />
        {STATUS_META[task.status].label}
        {images > 0 && (
          <span title={`${images} image${images > 1 ? "s" : ""}`} className="ml-1.5 flex items-center gap-0.5">
            <ImageIcon className="size-3" />
            {images}
          </span>
        )}
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

/** Copies an absolute share link for the task (anyone can open it; no account needed). */
export async function copyTaskLink(task: Task, sessionName: string) {
  try {
    await navigator.clipboard.writeText(location.origin + taskLink(task, sessionName));
    toast.success("Task link copied", { icon: <Link2 className="size-4" /> });
  } catch {
    toast.error("Couldn't copy the link.");
  }
}
