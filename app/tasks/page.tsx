"use client";

import { useState } from "react";
import { Plus, Pencil, Play, Search, ChevronRight } from "lucide-react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSessions } from "@/hooks/timer/use-sessions";
import { SessionSidebar } from "@/components/session/SessionSidebar";
import { BoardColumn } from "@/components/session/BoardColumn";
import { TaskDetail } from "@/components/session/TaskDetail";
import { TaskDialog } from "@/components/timer/task-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { Task, TaskStatus } from "@/hooks/timer/shared";

const COLUMN_ORDER: TaskStatus[] = ["todo", "in-progress", "done"];

export default function TasksPage() {
  const router = useRouter();
  const {
    sessions,
    activeSessionId,
    activeSession,
    setActiveSessionId,
    addSession,
    renameSession,
    deleteSession,
    updateSessionTasks,
  } = useSessions();

  const [addOpen, setAddOpen] = useState(false);
  const [addTargetStatus, setAddTargetStatus] = useState<TaskStatus>("todo");
  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const handleDragEnd = (result: DropResult) => {
    if (!activeSession) return;
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const movedTask = activeSession.tasks.find((t) => t.id === draggableId);
    if (!movedTask) return;

    const updatedTask: Task = {
      ...movedTask,
      status: destination.droppableId as TaskStatus,
    };

    // Remove the moved task from the flat list, then insert at the correct
    // column-relative index in the destination column.
    const withoutMoved = activeSession.tasks.filter((t) => t.id !== draggableId);
    const destColTasks = withoutMoved.filter(
      (t) => t.status === destination.droppableId,
    );
    destColTasks.splice(destination.index, 0, updatedTask);

    const finalTasks = COLUMN_ORDER.flatMap((status) =>
      status === (destination.droppableId as TaskStatus)
        ? destColTasks
        : withoutMoved.filter((t) => t.status === status),
    );

    updateSessionTasks(activeSession.id, finalTasks);
  };

  const openAdd = (status: TaskStatus) => {
    setAddTargetStatus(status);
    setAddOpen(true);
  };

  const handleAddSave = (data: { title: string; note?: string }) => {
    if (!activeSession) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: data.title.trim(),
      note: (data.note ?? "").trim(),
      status: addTargetStatus,
    };
    updateSessionTasks(activeSession.id, [...activeSession.tasks, newTask]);
    toast.success("Task added", { icon: <Plus className="size-4" /> });
    setAddOpen(false);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setEditOpen(true);
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
    setEditingTask(null);
    setEditOpen(false);
  };

  const deleteTask = (id: string) => {
    if (!activeSession) return;
    updateSessionTasks(
      activeSession.id,
      activeSession.tasks.filter((t) => t.id !== id),
    );
    toast("Task deleted", { icon: <Plus className="size-4" /> });
  };

  const setTaskStatus = (id: string, status: TaskStatus) => {
    if (!activeSession) return;
    updateSessionTasks(
      activeSession.id,
      activeSession.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    );
  };

  const handleStart = (sessionId: string) => {
    setActiveSessionId(sessionId);
    router.push("/timer");
  };

  if (!activeSession) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <p className="text-foreground/45 font-medium">
          No sessions available. Create one to get started.
        </p>
      </div>
    );
  }

  const tasks = activeSession.tasks;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const selectedTask = tasks.find((t) => t.id === selectedId) ?? null;
  const q = query.trim().toLowerCase();
  const visible = q
    ? tasks.filter((t) => `${t.title} ${t.note}`.toLowerCase().includes(q))
    : tasks;

  return (
    <>
      <div className="flex min-h-screen flex-1 flex-col gap-4 px-4 pt-2 pb-24 font-sans lg:flex-row lg:items-start">
        <SessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={setActiveSessionId}
          onAdd={addSession}
          onRename={renameSession}
          onDelete={deleteSession}
          onStart={handleStart}
        />

        <main className="flex min-w-0 flex-1 flex-col gap-6 rounded-xl border bg-card/40 p-4 sm:p-6">
          {/* Header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
              <span>Tasks</span>
              <ChevronRight className="size-3.5 shrink-0" />
              <span className="truncate font-semibold text-foreground">
                {activeSession.name}
              </span>
            </nav>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => openAdd("todo")}>
                <Plus /> New task
              </Button>
              <Button onClick={() => handleStart(activeSession.id)}>
                <Play /> Start focus
              </Button>
            </div>
          </header>

          {/* Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks..."
                className="bg-background pl-9"
              />
            </div>
            <div className="flex flex-1 items-center gap-3 sm:justify-end">
              <span className="text-xs font-semibold whitespace-nowrap text-muted-foreground">
                {doneCount}/{tasks.length} done
              </span>
              <Progress
                value={tasks.length ? (doneCount / tasks.length) * 100 : 0}
                className="h-1.5 sm:max-w-40"
              />
            </div>
          </div>
          {q && (
            <p className="-mt-3 text-xs text-muted-foreground">
              Showing {visible.length} of {tasks.length} tasks. Drag and drop is
              paused while searching.
            </p>
          )}

          {/* Board */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid gap-4 md:grid-cols-3">
              {COLUMN_ORDER.map((status, i) => (
                <BoardColumn
                  key={status}
                  status={status}
                  tasks={visible.filter((t) => t.status === status)}
                  selectedId={selectedId}
                  // Drop indices are column-relative, so they're only valid unfiltered.
                  dragDisabled={!!q}
                  onSelect={(t) => setSelectedId(t.id)}
                  onOpenAdd={openAdd}
                  onEdit={openEdit}
                  onDelete={deleteTask}
                  aosDelay={100 + i * 100}
                />
              ))}
            </div>
          </DragDropContext>
        </main>

        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            sessionName={activeSession.name}
            onStatus={(s) => setTaskStatus(selectedTask.id, s)}
            onEdit={() => openEdit(selectedTask)}
            onDelete={() => deleteTask(selectedTask.id)}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {addOpen && (
        <TaskDialog
          heading="Add Task"
          onSave={handleAddSave}
          onCancel={() => setAddOpen(false)}
        />
      )}

      {editOpen && editingTask && (
        <TaskDialog
          heading="Edit Task"
          defaultValues={{ title: editingTask.title, note: editingTask.note }}
          onSave={handleEditSave}
          onCancel={() => { setEditingTask(null); setEditOpen(false); }}
        />
      )}
    </>
  );
}
