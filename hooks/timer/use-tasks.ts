import { useState, useEffect } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { type Task, STORAGE_KEY } from "./shared";

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // ── Add ───────────────────────────────────────────────────────────────────
  const openAdd = () => setAddOpen(true);

  const closeAdd = () => setAddOpen(false);

  const handleAddSave = (data: { title: string; note?: string }) => {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: data.title.trim(),
        note: (data.note ?? "").trim(),
        completed: false,
      },
    ]);
    toast.success("Task added");
    closeAdd();
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (task: Task) => {
    setEditingTask(task);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditingTask(null);
    setEditOpen(false);
  };

  const handleEditSave = (data: { title: string; note?: string }) => {
    if (!editingTask) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTask.id
          ? { ...t, title: data.title.trim(), note: (data.note ?? "").trim() }
          : t,
      ),
    );
    toast.success("Task updated");
    closeEdit();
  };

  // ── Complete / Delete / Reorder ───────────────────────────────────────────
  const toggleComplete = (id: string) =>
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (task) {
        toast(task.completed ? "Marked incomplete" : "Marked complete");
      }
      return prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      );
    });

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast("Task deleted");
  };

  const reorderTasks = (activeId: string, overId: string) =>
    setTasks((prev) => {
      const from = prev.findIndex((t) => t.id === activeId);
      const to = prev.findIndex((t) => t.id === overId);
      return arrayMove(prev, from, to);
    });

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeTask = tasks.find((t) => !t.completed);

  return {
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
  };
}
