"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Play, Pencil, Trash2, Check, X } from "lucide-react";
import type { Session } from "@/hooks/timer/shared";

interface SessionSidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onStart?: (id: string) => void;
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onStart,
}: SessionSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    const name = window.prompt("Session name:");
    if (name && name.trim()) onAdd(name.trim());
  };

  const startRename = (session: Session) => {
    setEditingId(session.id);
    setEditValue(session.name);
  };

  const commitRename = () => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <aside
      className="flex max-h-72 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-sidebar-border bg-sidebar text-sidebar-foreground lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:w-[240px]"
      data-aos="fade-right"
      data-aos-duration="500"
      data-aos-offset="0"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-sidebar-border">
        <span className="text-xs font-bold uppercase tracking-wider opacity-60">Sessions</span>
        <button
          onClick={handleAdd}
          aria-label="New session"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold opacity-70 hover:opacity-100 hover:bg-sidebar-accent transition cursor-pointer"
        >
          <Plus size={14} />
          New
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {sessions.length === 0 && (
          <p className="text-xs opacity-50 text-center pt-8">
            No sessions yet
          </p>
        )}

        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          const isEditing = editingId === session.id;

          return (
            <div
              key={session.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "opacity-70 hover:opacity-100 hover:bg-sidebar-accent/60",
              )}
              onClick={() => {
                if (!isEditing) onSelect(session.id);
              }}
            >
              {isEditing ? (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={commitRename}
                    className="flex-1 bg-transparent border-b border-sidebar-ring text-sm font-semibold outline-none min-w-0"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      commitRename();
                    }}
                    className="p-0.5 opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(null);
                    }}
                    className="p-0.5 opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      isActive ? "bg-sidebar-primary" : "bg-current opacity-30",
                    )}
                  />
                  <span className="flex-1 truncate text-sm font-semibold">
                    {session.name}
                  </span>
                  <span className="text-[10px] font-semibold opacity-50 group-hover:hidden">
                    {session.tasks.filter((t) => t.status === "done").length}/
                    {session.tasks.length}
                  </span>

                  {onStart && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStart(session.id);
                      }}
                      aria-label="Start session"
                      className="hidden group-hover:block p-1 rounded opacity-60 hover:opacity-100 transition-all cursor-pointer"
                    >
                      <Play size={12} />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(session);
                    }}
                    aria-label="Rename"
                    className="hidden group-hover:block p-1 rounded opacity-60 hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Pencil size={12} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${session.name}"?`))
                        onDelete(session.id);
                    }}
                    aria-label="Delete"
                    className="hidden group-hover:block p-1 rounded opacity-60 hover:opacity-100 hover:text-destructive transition-all cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
