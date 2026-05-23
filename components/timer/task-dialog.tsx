"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const taskFormSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  note: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskDialogProps {
  heading: string;
  defaultValues?: TaskFormData;
  onSave: (data: TaskFormData) => void;
  onCancel: () => void;
}

export function TaskDialog({
  heading,
  defaultValues = { title: "", note: "" },
  onSave,
  onCancel,
}: TaskDialogProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  const handleSubmit = form.handleSubmit(onSave);

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
            className="w-9 h-9 rounded-full border border-foreground/20 flex items-center justify-center text-foreground/50 hover:text-foreground hover:border-foreground/40 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="h-px bg-foreground/10" />

        {/* Body */}
        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 px-8 pt-6 pb-8"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground">
                    Task
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoFocus
                      placeholder="What are you working on?"
                      className="h-12 bg-foreground/[0.04] border-foreground/15 focus-visible:ring-foreground/20 focus-visible:border-foreground/25"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground">
                    Note{" "}
                    <span className="font-normal text-foreground/40">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any notes..."
                      rows={4}
                      className="resize-none bg-foreground/[0.04] border-foreground/15 focus-visible:ring-foreground/20 focus-visible:border-foreground/25"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 h-14 rounded-xl border border-foreground/20 font-semibold text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-14 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition-opacity disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
