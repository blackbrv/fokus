"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
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
} from "@dnd-kit/sortable";
import { useTimer } from "@/hooks/timer/use-timer";
import { useTasks } from "@/hooks/timer/use-tasks";
import { useNotification } from "@/hooks/use-notification";
import { useAudio } from "@/hooks/use-audio";
import { TaskDialog } from "@/components/timer/task-dialog";
import { SortableTaskItem } from "@/components/timer/sortable-task-item";
import { DURATIONS, MODE_LABELS, fmt, type TimerMode } from "@/hooks/timer/shared";

const MODE_NOTIFICATIONS: Record<TimerMode, { title: string; body: string }> = {
  pomodoro: { title: "Pomodoro Complete!", body: "Time for a break!" },
  "short-break": { title: "Short Break Over!", body: "Ready to focus again." },
  "long-break": { title: "Long Break Over!", body: "Ready to focus again!" },
};

export default function TimerPage() {
  const { notify, requestPermission } = useNotification();
  const { playBreakChime, playFocusChime } = useAudio();
  const timer = useTimer((m) => {
    const n = MODE_NOTIFICATIONS[m];
    notify(n.title, n.body);
    if (m === "pomodoro") playBreakChime();
    else playFocusChime();
  });
  const {
    tasks,
    activeTask,
    addOpen,
    editOpen,
    editingTask,
    openAdd,
    closeAdd,
    handleAddSave,
    openEdit,
    closeEdit,
    handleEditSave,
    toggleComplete,
    deleteTask,
    reorderTasks,
  } = useTasks();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleStart = () => {
    requestPermission();
    timer.handleStartPause();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTasks(String(active.id), String(over.id));
    }
  };

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
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {tasks.map((task) => (
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

      {/* Add Task dialog */}
      {addOpen && (
        <TaskDialog
          heading="Add Task"
          onSave={handleAddSave}
          onCancel={closeAdd}
        />
      )}

      {/* Edit Task dialog */}
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
