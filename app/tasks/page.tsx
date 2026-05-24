"use client";

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
import { useTasks } from "@/hooks/timer/use-tasks";
import { TaskDialog } from "@/components/timer/task-dialog";
import { SortableTaskItem } from "@/components/timer/sortable-task-item";

export default function TasksPage() {
  const {
    tasks,
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
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTasks(String(active.id), String(over.id));
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col items-center pt-10 pb-24 px-4 font-sans min-h-screen">
        <div className="w-full max-w-[700px] flex flex-col items-center gap-7">
          <h1
            className="text-3xl font-bold text-foreground"
            data-aos="fade-down"
            data-aos-duration="600"
            data-aos-offset="0"
          >
            Tasks
          </h1>

          <div
            className="w-full flex flex-col gap-2"
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="100"
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
                    isActive={false}
                    onToggleComplete={toggleComplete}
                    onEdit={openEdit}
                    onDelete={deleteTask}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {tasks.length === 0 && (
              <p className="text-center text-foreground/45 font-medium py-10">
                No tasks yet. Add one to get started.
              </p>
            )}

            <button
              onClick={openAdd}
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="200"
              data-aos-offset="0"
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
