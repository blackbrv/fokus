"use client";

import { useState, useCallback, useRef } from "react";
import { Plus, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
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
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSessions } from "@/hooks/timer/use-sessions";
import { useTimer } from "@/hooks/timer/use-timer";
import { useNotification } from "@/hooks/use-notification";
import { useAudio } from "@/hooks/use-audio";
import { TaskDialog } from "@/components/timer/task-dialog";
import { SortableTaskItem } from "@/components/timer/sortable-task-item";
import { MODES, MODE_LABELS, fmt, type TimerMode } from "@/hooks/timer/shared";
import type { Task } from "@/hooks/timer/shared";

const MODE_NOTIFICATIONS: Record<TimerMode, { title: string; body: string }> = {
  pomodoro: { title: "Pomodoro Complete!", body: "Time for a break!" },
  "short-break": { title: "Short Break Over!", body: "Ready to focus again." },
  "long-break": { title: "Long Break Over!", body: "Ready to focus again!" },
};

export default function TimerPage() {
  const {
    sessions,
    activeSession,
    setActiveSessionId,
    updateSessionTasks,
    updateSessionTimerState,
    stopAllTimers,
  } = useSessions();

  const { notify, requestPermission } = useNotification();
  const { playBreakChime, playFocusChime } = useAudio();

  const handleTimerComplete = useCallback(
    (m: TimerMode) => {
      const n = MODE_NOTIFICATIONS[m];
      notify(n.title, n.body);
      if (m === "pomodoro") playBreakChime();
      else playFocusChime();
    },
    [notify, playBreakChime, playFocusChime],
  );

  const timer = useTimer(
    activeSession?.id ?? "none",
    activeSession?.settings ?? {
      pomodoroMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      longBreakInterval: 4,
    },
    activeSession?.timerState ?? {
      mode: "pomodoro",
      remainingSeconds: 25 * 60,
      pomodoroCount: 1,
      isRunning: false,
    },
    (state) => {
      if (activeSession) {
        updateSessionTimerState(activeSession.id, state);
      }
    },
    handleTimerComplete,
  );

  const sessionScrollRef = useRef<HTMLDivElement>(null);
  const scrollSessions = (dir: "left" | "right") => {
    sessionScrollRef.current?.scrollBy({ left: dir === "left" ? -130 : 130, behavior: "smooth" });
  };

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleStart = () => {
    requestPermission();
    if (activeSession) {
      const anyRunning = sessions.some(
        (s) => s.id !== activeSession.id && s.timerState.isRunning,
      );
      if (anyRunning) stopAllTimers();
    }
    timer.handleStartPause();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !activeSession) return;
    const arr = activeSession.tasks;
    const from = arr.findIndex((t) => t.id === String(active.id));
    const to = arr.findIndex((t) => t.id === String(over.id));
    updateSessionTasks(activeSession.id, arrayMove(arr, from, to));
  };

  const openAdd = () => setAddOpen(true);
  const closeAdd = () => setAddOpen(false);
  const handleAddSave = (data: { title: string; note?: string }) => {
    if (!activeSession) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: data.title.trim(),
      note: (data.note ?? "").trim(),
      status: "todo",
    };
    updateSessionTasks(activeSession.id, [...activeSession.tasks, newTask]);
    toast.success("Task added", { icon: <Plus className="size-4" /> });
    closeAdd();
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditingTask(null);
    setEditOpen(false);
  };
  const handleEditSave = (data: { title: string; note?: string }) => {
    if (!activeSession || !editingTask) return;
    updateSessionTasks(
      activeSession.id,
      activeSession.tasks.map((t) =>
        t.id === editingTask.id
          ? { ...t, title: data.title.trim(), note: (data.note ?? "").trim() }
          : t,
      ),
    );
    toast.success("Task updated", { icon: <Pencil className="size-4" /> });
    closeEdit();
  };

  const toggleComplete = (id: string) => {
    if (!activeSession) return;
    updateSessionTasks(
      activeSession.id,
      activeSession.tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? "todo" : "done" }
          : t,
      ),
    );
  };

  const deleteTask = (id: string) => {
    if (!activeSession) return;
    updateSessionTasks(
      activeSession.id,
      activeSession.tasks.filter((t) => t.id !== id),
    );
    toast("Task deleted", { icon: <Plus className="size-4" /> });
  };

  const activeTask = activeSession?.tasks.find((t) => t.status !== "done") ?? null;

  if (!activeSession) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <p className="text-foreground/45 font-medium">
          No sessions available. Create one on the Tasks page.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-start pt-10 pb-24 px-4 font-sans min-h-screen">
        <div className="w-full max-w-[700px] flex flex-col items-center gap-7">
          {/* Session switcher */}
          {sessions.length > 1 && (
            <div
              className="flex items-center gap-1.5"
              data-aos="fade-down"
              data-aos-duration="600"
              data-aos-offset="0"
            >
              {sessions.length > 3 && (
                <button
                  onClick={() => scrollSessions("left")}
                  aria-label="Scroll sessions left"
                  className="shrink-0 w-7 h-7 rounded-lg border border-foreground/20 flex items-center justify-center text-foreground/50 hover:border-foreground/40 hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
              )}

              <div
                ref={sessionScrollRef}
                className={cn(
                  "flex items-center gap-1.5",
                  sessions.length > 3
                    ? "overflow-x-auto max-w-[260px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    : "flex-wrap justify-center",
                )}
              >
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={cn(
                      "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      s.id === activeSession.id
                        ? "bg-foreground text-background"
                        : "border border-foreground/20 text-foreground/60 hover:border-foreground/40 hover:text-foreground",
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              {sessions.length > 3 && (
                <button
                  onClick={() => scrollSessions("right")}
                  aria-label="Scroll sessions right"
                  className="shrink-0 w-7 h-7 rounded-lg border border-foreground/20 flex items-center justify-center text-foreground/50 hover:border-foreground/40 hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          )}

          {/* Mode tabs */}
          <div
            className="flex items-center gap-2"
            data-aos="fade-down"
            data-aos-duration="600"
            data-aos-offset="0"
          >
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => timer.changeMode(m)}
                className={cn(
                  "h-[50px] px-5 rounded-full text-sm font-semibold transition-all cursor-pointer",
                  timer.mode === m
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
              onClick={() => timer.adjustMinutes(-1)}
              disabled={timer.isRunning}
              aria-label="Decrease by 1 minute"
              data-aos="fade-right"
              data-aos-duration="500"
              data-aos-delay="150"
              data-aos-offset="0"
              className="w-[50px] h-[50px] rounded-xl bg-foreground text-background text-xl font-bold flex items-center justify-center hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity select-none cursor-pointer"
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
              {fmt(timer.timeLeft)}
            </span>

            <button
              onClick={() => timer.adjustMinutes(1)}
              disabled={timer.isRunning}
              aria-label="Increase by 1 minute"
              data-aos="fade-left"
              data-aos-duration="500"
              data-aos-delay="150"
              data-aos-offset="0"
              className="w-[50px] h-[50px] rounded-xl bg-foreground text-background text-xl font-bold flex items-center justify-center hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity select-none cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Start / Pause / Restart */}
          <button
            onClick={handleStart}
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="280"
            data-aos-offset="0"
            className="w-[250px] h-[72px] bg-foreground text-background rounded-xl text-[22px] font-black tracking-[0.2em] hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            {timer.btnLabel}
          </button>

          {/* Active task name + session count */}
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
              #{timer.sessionCount}
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
                items={activeSession.tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {activeSession.tasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    isActive={task.id === activeTask?.id}
                    onToggleComplete={toggleComplete}
                    onEdit={openEdit}
                    onDelete={deleteTask}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <button
              onClick={openAdd}
              className="w-full h-[60px] rounded-xl border-2 border-dashed border-foreground/20 flex items-center justify-center gap-2 text-foreground/45 font-semibold text-sm hover:border-foreground/35 hover:text-foreground/65 transition-colors cursor-pointer"
            >
              <Plus size={18} />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {addOpen && (
        <TaskDialog
          heading="Add Task"
          onSave={handleAddSave}
          onCancel={closeAdd}
        />
      )}

      {editOpen && editingTask && (
        <TaskDialog
          heading="Edit Task"
          defaultValues={{ title: editingTask.title, note: editingTask.note }}
          onSave={handleEditSave}
          onCancel={closeEdit}
        />
      )}
    </>
  );
}
