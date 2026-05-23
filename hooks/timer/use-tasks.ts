import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { type Task } from "./shared";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogNote, setDialogNote] = useState("");

  // ── Add ───────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setDialogTitle("");
    setDialogNote("");
    setAddOpen(true);
  };

  const closeAdd = () => {
    setDialogTitle("");
    setDialogNote("");
    setAddOpen(false);
  };

  const handleAddSave = () => {
    if (!dialogTitle.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: dialogTitle.trim(),
        note: dialogNote.trim(),
        completed: false,
      },
    ]);
    closeAdd();
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDialogTitle(task.title);
    setDialogNote(task.note);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditingTask(null);
    setDialogTitle("");
    setDialogNote("");
    setEditOpen(false);
  };

  const handleEditSave = () => {
    if (!editingTask || !dialogTitle.trim()) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTask.id
          ? { ...t, title: dialogTitle.trim(), note: dialogNote.trim() }
          : t,
      ),
    );
    closeEdit();
  };

  // ── Complete / Delete / Reorder ───────────────────────────────────────────
  const toggleComplete = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );

  const deleteTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

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
    dialogTitle,
    dialogNote,
    setDialogTitle,
    setDialogNote,
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
