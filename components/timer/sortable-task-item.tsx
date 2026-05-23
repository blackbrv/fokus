"use client";

import { useState, useRef } from "react";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { type Task } from "@/hooks/timer/shared";

const SWIPE_THRESHOLD = 100;

interface SortableTaskItemProps {
  task: Task;
  isActive: boolean;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function SortableTaskItem({
  task,
  isActive,
  onToggleComplete,
  onEdit,
  onDelete,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef<number | null>(null);

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // 0→1 as the item is swiped toward the delete threshold
  const swipeProgress = Math.min(Math.abs(swipeX) / SWIPE_THRESHOLD, 1);

  const onSwipeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore clicks on buttons — they handle their own actions
    if ((e.target as HTMLElement).closest("button")) return;
    startXRef.current = e.clientX;
    setIsSwiping(true);
    // Capture so fast swipes don't lose events when pointer leaves the element
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onSwipeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return;
    setSwipeX(e.clientX - startXRef.current);
  };

  const onSwipeEnd = () => {
    startXRef.current = null;
    setIsSwiping(false);
    if (Math.abs(swipeX) >= SWIPE_THRESHOLD) {
      // Animate off-screen then remove from state
      setSwipeX(swipeX > 0 ? 600 : -600);
      setTimeout(() => onDelete(task.id), 280);
    } else {
      // Snap back
      setSwipeX(0);
    }
  };

  return (
    // Outer div: owned by dnd-kit for vertical sorting
    <div
      ref={setNodeRef}
      style={dndStyle}
      className={cn(
        "relative h-[60px] rounded-xl",
        !isDragging && isActive && "ring-2 ring-foreground/40",
      )}
    >
      {/* Red background — fades in proportionally as the item is swiped */}
      <div
        className="absolute inset-0 rounded-xl bg-destructive flex items-center justify-center"
        style={{ opacity: swipeProgress }}
      >
        <Trash2 size={16} className="text-destructive-foreground" />
      </div>

      {/* Inner div: translates horizontally on swipe */}
      <div
        onPointerDown={onSwipeStart}
        onPointerMove={onSwipeMove}
        onPointerUp={onSwipeEnd}
        onPointerCancel={onSwipeEnd}
        style={{
          transform: `translateX(${swipeX}px)`,
          // No transition while the finger is down (real-time follow);
          // spring-back or exit animation when released
          transition: isSwiping ? "none" : "transform 0.3s ease",
        }}
        className={cn(
          "absolute inset-0 flex items-center gap-3 px-4 rounded-xl select-none touch-pan-y",
          "bg-foreground text-background",
          isDragging
            ? "opacity-50 shadow-2xl"
            : isActive
            ? "opacity-100"
            : "opacity-80",
        )}
      >
        {/* Drag handle — the only element that triggers dnd-kit's vertical sort */}
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          aria-label="Drag to reorder"
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-background/25 hover:text-background/60 transition-colors touch-none shrink-0"
        >
          <GripVertical size={14} />
        </button>

        {/* Completion toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          className={cn(
            "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer",
            task.completed
              ? "border-background/80 bg-background/80"
              : "border-background/50 hover:border-background",
          )}
        >
          {task.completed && <div className="w-2 h-2 rounded-full bg-foreground" />}
        </button>

        {/* Title */}
        <span
          className={cn(
            "flex-1 text-sm font-semibold truncate",
            task.completed && "line-through opacity-50",
          )}
        >
          {task.title}
        </span>

        {/* Edit */}
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          aria-label={`Edit ${task.title}`}
          className="p-1.5 rounded-md text-background/40 hover:text-background/80 transition-colors cursor-pointer"
        >
          <Pencil size={14} />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          aria-label={`Delete ${task.title}`}
          className="p-1.5 rounded-md text-background/40 hover:text-red-400 transition-colors cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
