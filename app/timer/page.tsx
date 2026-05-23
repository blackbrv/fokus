"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Plus, Pencil, X, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Types ────────────────────────────────────────────────────────────────────

type TimerMode = "pomodoro" | "short-break" | "long-break";

type Task = {
  id: string;
  title: string;
  note: string;
  completed: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DURATIONS: Record<TimerMode, number> = {
  pomodoro: 25 * 60,
  "short-break": 5 * 60,
  "long-break": 15 * 60,
};

const MODE_LABELS: Record<TimerMode, string> = {
  pomodoro: "Pomodoro",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── TaskDialog ───────────────────────────────────────────────────────────────

interface TaskDialogProps {
  heading: string;
  taskTitle: string;
  taskNote: string;
  onTitleChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function TaskDialog({
  heading,
  taskTitle,
  taskNote,
  onTitleChange,
  onNoteChange,
  onSave,
  onCancel,
}: TaskDialogProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[700px] bg-background rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5">
          <h2 className="text-2xl font-bold text-foreground">{heading}</h2>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="w-9 h-9 rounded-full border border-foreground/20 flex items-center justify-center text-foreground/50 hover:text-foreground hover:border-foreground/40 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-foreground/10" />

        {/* Body */}
        <div className="flex flex-col gap-5 px-8 pt-6 pb-8">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-foreground">
              Task
            </Label>
            <Input
              autoFocus
              value={taskTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSave()}
              placeholder="What are you working on?"
              className="h-12 bg-foreground/[0.04] border-foreground/15 focus-visible:ring-foreground/20 focus-visible:border-foreground/25"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-foreground">
              Note{" "}
              <span className="font-normal text-foreground/40">(optional)</span>
            </Label>
            <Textarea
              value={taskNote}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Add any notes..."
              rows={4}
              className="resize-none bg-foreground/[0.04] border-foreground/15 focus-visible:ring-foreground/20 focus-visible:border-foreground/25"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 h-14 rounded-xl border border-foreground/20 font-semibold text-foreground hover:bg-foreground/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={!taskTitle.trim()}
              className="flex-1 h-14 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SortableTaskItem ─────────────────────────────────────────────────────────

interface SortableTaskItemProps {
  task: Task;
  isActive: boolean;
  onSetActive: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
}

function SortableTaskItem({
  task,
  isActive,
  onSetActive,
  onToggleComplete,
  onEdit,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSetActive(task.id)}
      className={cn(
        "flex items-center gap-3 px-4 h-[60px] rounded-xl cursor-pointer select-none",
        "bg-foreground text-background transition-shadow",
        isDragging
          ? "opacity-50 shadow-2xl"
          : isActive
          ? "ring-2 ring-offset-1 ring-foreground/40 opacity-100"
          : "opacity-80 hover:opacity-100",
      )}
    >
      {/* Drag handle */}
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

      {/* Radio / complete toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(task.id);
        }}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors",
          task.completed
            ? "border-background/80 bg-background/80"
            : "border-background/50 hover:border-background",
        )}
      >
        {task.completed && (
          <div className="w-2 h-2 rounded-full bg-foreground" />
        )}
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
        onClick={(e) => {
          e.stopPropagation();
          onEdit(task);
        }}
        aria-label={`Edit ${task.title}`}
        className="p-1.5 rounded-md text-background/40 hover:text-background/80 transition-colors"
      >
        <Pencil size={14} />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TimerPage() {
  // Timer state
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogNote, setDialogNote] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Stores the effective session duration so +/- persists across pause/resume
  const sessionDuration = useRef(DURATIONS.pomodoro);

  // ── DnD sensors ───────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ── Timer tick ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (mode === "pomodoro") setSessionCount((c) => c + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  // ── Mode change ───────────────────────────────────────────────────────────

  const changeMode = useCallback((m: TimerMode) => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode(m);
    sessionDuration.current = DURATIONS[m];
    setTimeLeft(DURATIONS[m]);
  }, []);

  // ── Start / Pause / Restart ───────────────────────────────────────────────

  const handleStartPause = () => {
    if (timeLeft === 0) {
      setTimeLeft(sessionDuration.current);
      setIsRunning(true);
    } else {
      setIsRunning((p) => !p);
    }
  };

  // ── +/– duration adjust (only while stopped) ─────────────────────────────

  const adjustMinutes = (delta: number) => {
    if (isRunning) return;
    setTimeLeft((prev) => {
      const next = Math.max(60, prev + delta * 60);
      sessionDuration.current = next;
      return next;
    });
  };

  // ── Task CRUD ─────────────────────────────────────────────────────────────

  const openAdd = () => {
    setDialogTitle("");
    setDialogNote("");
    setAddOpen(true);
  };

  const handleAddSave = () => {
    if (!dialogTitle.trim()) return;
    const task: Task = {
      id: crypto.randomUUID(),
      title: dialogTitle.trim(),
      note: dialogNote.trim(),
      completed: false,
    };
    setTasks((p) => [...p, task]);
    if (!activeTaskId) setActiveTaskId(task.id);
    setDialogTitle("");
    setDialogNote("");
    setAddOpen(false);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDialogTitle(task.title);
    setDialogNote(task.note);
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editingTask || !dialogTitle.trim()) return;
    setTasks((p) =>
      p.map((t) =>
        t.id === editingTask.id
          ? { ...t, title: dialogTitle.trim(), note: dialogNote.trim() }
          : t,
      ),
    );
    closeEdit();
  };

  const closeEdit = () => {
    setEditingTask(null);
    setDialogTitle("");
    setDialogNote("");
    setEditOpen(false);
  };

  const toggleComplete = (id: string) => {
    setTasks((p) =>
      p.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  // ── Drag end ──────────────────────────────────────────────────────────────

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((t) => t.id === active.id);
        const newIndex = items.findIndex((t) => t.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const btnLabel = isRunning ? "PAUSE" : timeLeft === 0 ? "RESTART" : "START";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-start pt-10 pb-24 px-4 font-sans">
        <div className="w-full max-w-[700px] flex flex-col items-center gap-7">

          {/* Mode tabs */}
          <div
            className="flex items-center gap-2"
            data-aos="fade-down"
            data-aos-duration="600"
            data-aos-offset="0"
          >
            {(Object.keys(DURATIONS) as TimerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => changeMode(m)}
                className={cn(
                  "h-[50px] px-5 rounded-full text-sm font-semibold transition-all",
                  mode === m
                    ? "bg-foreground text-background"
                    : "border border-foreground/25 text-foreground hover:bg-foreground/5",
                )}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Timer display */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => adjustMinutes(-1)}
              disabled={isRunning}
              aria-label="Decrease by 1 minute"
              data-aos="fade-right"
              data-aos-duration="500"
              data-aos-delay="150"
              data-aos-offset="0"
              className="w-[50px] h-[50px] rounded-xl bg-foreground text-background text-xl font-bold flex items-center justify-center hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity select-none"
            >
              −
            </button>

            <span
              data-aos="zoom-in"
              data-aos-duration="700"
              data-aos-delay="150"
              data-aos-offset="0"
              className="text-[96px] font-bold leading-none tracking-tighter tabular-nums select-none text-foreground"
            >
              {fmt(timeLeft)}
            </span>

            <button
              onClick={() => adjustMinutes(1)}
              disabled={isRunning}
              aria-label="Increase by 1 minute"
              data-aos="fade-left"
              data-aos-duration="500"
              data-aos-delay="150"
              data-aos-offset="0"
              className="w-[50px] h-[50px] rounded-xl bg-foreground text-background text-xl font-bold flex items-center justify-center hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity select-none"
            >
              +
            </button>
          </div>

          {/* Start / Pause button */}
          <button
            onClick={handleStartPause}
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="280"
            data-aos-offset="0"
            className="w-[250px] h-[72px] bg-foreground text-background rounded-xl text-[22px] font-black tracking-[0.2em] hover:opacity-90 active:scale-[0.98] transition-all"
          >
            {btnLabel}
          </button>

          {/* Subtitle */}
          <div
            className="flex items-baseline gap-2 -mt-2"
            data-aos="fade-up"
            data-aos-duration="500"
            data-aos-delay="360"
            data-aos-offset="0"
          >
            <span className="text-lg font-semibold text-foreground">
              {activeTask?.title ?? "Time to fokus!"}
            </span>
            <span className="text-lg font-medium text-foreground/35">
              #{sessionCount}
            </span>
          </div>

          {/* Task list */}
          <div
            className="w-full flex flex-col gap-2"
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="440"
            data-aos-offset="0"
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {tasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    isActive={activeTaskId === task.id}
                    onSetActive={setActiveTaskId}
                    onToggleComplete={toggleComplete}
                    onEdit={openEdit}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Add Task row */}
            <button
              onClick={openAdd}
              className="w-full h-[60px] rounded-xl border-2 border-dashed border-foreground/20 flex items-center justify-center gap-2 text-foreground/45 font-semibold text-sm hover:border-foreground/35 hover:text-foreground/65 transition-colors"
            >
              <Plus size={18} />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Add Task dialog */}
      {addOpen && (
        <TaskDialog
          heading="Add Task"
          taskTitle={dialogTitle}
          taskNote={dialogNote}
          onTitleChange={setDialogTitle}
          onNoteChange={setDialogNote}
          onSave={handleAddSave}
          onCancel={() => { setDialogTitle(""); setDialogNote(""); setAddOpen(false); }}
        />
      )}

      {/* Edit Task dialog */}
      {editOpen && editingTask && (
        <TaskDialog
          heading="Edit Task"
          taskTitle={dialogTitle}
          taskNote={dialogNote}
          onTitleChange={setDialogTitle}
          onNoteChange={setDialogNote}
          onSave={handleEditSave}
          onCancel={closeEdit}
        />
      )}
    </>
  );
}
