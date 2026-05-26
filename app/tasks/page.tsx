"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSessions } from "@/hooks/timer/use-sessions";
import { SessionSidebar } from "@/components/session/SessionSidebar";
import { BoardColumn } from "@/components/session/BoardColumn";
import { TaskDialog } from "@/components/timer/task-dialog";
import type { Task, TaskStatus } from "@/hooks/timer/shared";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "To Do" },
  { status: "in-progress", label: "In Progress" },
  { status: "done", label: "Done" },
];

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

  return (
    <>
      <div className="flex flex-1 min-h-screen pt-4 pb-24 px-4 gap-4 font-sans">
        <SessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={setActiveSessionId}
          onAdd={addSession}
          onRename={renameSession}
          onDelete={deleteSession}
          onStart={handleStart}
        />

        <main className="flex-1 flex items-start justify-center min-w-0 pt-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex items-start gap-3 overflow-x-auto pb-4 max-w-[900px] w-full">
              {COLUMNS.map((col, i) => (
                <BoardColumn
                  key={col.status}
                  status={col.status}
                  label={col.label}
                  tasks={activeSession.tasks.filter(
                    (t) => t.status === col.status,
                  )}
                  onOpenAdd={openAdd}
                  onEdit={openEdit}
                  onDelete={deleteTask}
                  aosDelay={100 + i * 100}
                />
              ))}
            </div>
          </DragDropContext>
        </main>
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
