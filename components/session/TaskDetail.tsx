"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Link2, Maximize2, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { copyTaskLink, StatusDot, STATUS_META, TagChips } from "./BoardTaskCardContent";
import { NoteContent } from "./NoteContent";
import {
  formatTaskTime,
  type Task,
  type TaskEvent,
  type TaskStatus,
  taskLink,
} from "@/hooks/timer/shared";

function StatusLabel({ status }: { status: TaskStatus }) {
  return (
    <span className="mx-0.5 inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 align-middle text-[11px] font-semibold leading-none text-foreground">
      <StatusDot status={status} className="size-1.5" />
      {STATUS_META[status].label}
    </span>
  );
}

function describe(e: TaskEvent): ReactNode {
  switch (e.type) {
    case "created":
      return "Task created";
    case "renamed":
      return (
        <>
          Renamed from <span className="font-semibold">&ldquo;{e.from}&rdquo;</span>
        </>
      );
    case "note":
      return `Note ${e.change}`;
    case "status":
      return (
        <>
          Moved from <StatusLabel status={e.from} /> to <StatusLabel status={e.to} />
        </>
      );
    case "tag":
      return (
        <>
          Tag <span className="font-semibold">{e.key}</span> {e.change}
        </>
      );
  }
}

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
    <aside className="sticky top-24 hidden w-[320px] shrink-0 flex-col self-start rounded-xl border bg-card text-card-foreground animate-in fade-in-0 slide-in-from-right-4 duration-300 xl:flex">
      <div className="flex items-center justify-between border-b px-5 py-3 text-xs text-muted-foreground">
        <span>
          In <span className="font-semibold text-foreground">{sessionName}</span>
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={() => copyTaskLink(task, sessionName)}
            aria-label="Copy task link"
            title="Copy task link"
            className="rounded-md p-1 hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <Link2 size={14} />
          </button>
          <Link
            href={taskLink(task, sessionName)}
            target="_blank"
            aria-label="Open full screen"
            title="Open full screen"
            className="rounded-md p-1 hover:bg-muted hover:text-foreground"
          >
            <Maximize2 size={14} />
          </Link>
          <button
            onClick={onClose}
            aria-label="Close details"
            className="rounded-md p-1 hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Keyed by task so the content cross-fades when another card is picked. */}
      <div
        key={task.id}
        className="flex flex-col gap-6 p-5 animate-in fade-in-0 slide-in-from-bottom-1 duration-200"
      >
        <div>
          <h2 className="text-xl font-bold leading-tight break-words">{task.title}</h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {task.createdAt
              ? `Created ${formatTaskTime(task.createdAt)}`
              : "Created before activity tracking"}
          </p>
        </div>

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
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-[color,background-color,border-color,transform] duration-200 active:scale-95 cursor-pointer",
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
            Tags
          </h3>
          {task.tags?.length ? (
            <TagChips tags={task.tags} />
          ) : (
            <p className="text-sm text-muted-foreground italic">No tags. Add them with Edit.</p>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Note
          </h3>
          {task.note ? (
            <NoteContent note={task.note} className="text-sm leading-relaxed" />
          ) : (
            <p className="text-sm text-muted-foreground italic">No note added.</p>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Activity
          </h3>
          {task.history?.length ? (
            // Scroll on a padded wrapper so the timeline dots outside the line aren't clipped.
            <div className="max-h-64 overflow-y-auto pr-1 pl-2">
              <ol className="ml-1 space-y-3 border-l pl-4">
                {[...task.history].reverse().map((e, i) => (
                  <li key={`${e.at}-${i}`} className="relative">
                    <span
                      className={cn(
                        "absolute top-1.5 -left-[21px] size-2 rounded-full ring-4 ring-card",
                        i === 0 ? "bg-primary" : "bg-muted-foreground/40",
                      )}
                    />
                    <p className="text-sm leading-relaxed break-words">{describe(e)}</p>
                    <time
                      dateTime={new Date(e.at).toISOString()}
                      className="text-xs text-muted-foreground"
                    >
                      {formatTaskTime(e.at)}
                    </time>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No activity recorded yet.</p>
          )}
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
