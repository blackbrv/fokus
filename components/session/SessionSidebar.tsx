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
      className="flex h-full w-[260px] shrink-0 flex-col bg-foreground text-background rounded-xl overflow-hidden"
      data-aos="fade-right"
      data-aos-duration="500"
      data-aos-offset="0"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[60px] shrink-0 border-b border-background/10">
        <span className="text-sm font-bold tracking-wide">Sessions</span>
        <button
          onClick={handleAdd}
          aria-label="New session"
          className="flex items-center gap-1.5 text-xs font-semibold text-background/60 hover:text-background transition-colors cursor-pointer"
        >
          <Plus size={14} />
          New
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {sessions.length === 0 && (
          <p className="text-xs text-background/40 text-center pt-8">
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
                  ? "bg-background/15 text-background"
                  : "text-background/60 hover:text-background hover:bg-background/5",
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
                    className="flex-1 bg-transparent border-b border-background/40 text-sm font-semibold text-background outline-none min-w-0"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      commitRename();
                    }}
                    className="p-0.5 text-background/50 hover:text-background cursor-pointer"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(null);
                    }}
                    className="p-0.5 text-background/50 hover:text-background cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 truncate text-sm font-semibold">
                    {session.name}
                  </span>

                  {onStart && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStart(session.id);
                      }}
                      aria-label="Start session"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-background/40 hover:text-background transition-all cursor-pointer"
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
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-background/40 hover:text-background transition-all cursor-pointer"
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
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-background/40 hover:text-red-400 transition-all cursor-pointer"
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
