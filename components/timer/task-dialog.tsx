"use client";

import { useEffect, useId } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
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
import { tagsSchema } from "@/hooks/timer/shared";

const taskFormSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  note: z.string().optional(),
  tags: tagsSchema,
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskDialogProps {
  heading: string;
  defaultValues?: Partial<TaskFormData>;
  /** Tag keys already used in the session, offered as suggestions. */
  tagKeys?: string[];
  onSave: (data: TaskFormData) => void;
  onCancel: () => void;
}

const fieldClass =
  "bg-foreground/[0.04] border-foreground/15 focus-visible:ring-foreground/20 focus-visible:border-foreground/25";

export function TaskDialog({
  heading,
  defaultValues,
  tagKeys = [],
  onSave,
  onCancel,
}: TaskDialogProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: "", note: "", tags: [], ...defaultValues },
  });
  const tags = useFieldArray({ control: form.control, name: "tags" });
  const keyListId = useId();


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
      <div className="relative z-10 w-full max-w-[700px] max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl">
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

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">
                Tags{" "}
                <span className="font-normal text-foreground/40">(optional, e.g. priority: high)</span>
              </span>
              <datalist id={keyListId}>
                {tagKeys.map((k) => (
                  <option key={k} value={k} />
                ))}
              </datalist>
              {tags.fields.map((row, i) => (
                <div key={row.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`tags.${i}.key`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...field} list={keyListId} placeholder="Key" aria-label="Tag key" className={fieldClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`tags.${i}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...field} placeholder="Value" aria-label="Tag value" className={fieldClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => tags.remove(i)}
                    aria-label="Remove tag"
                    className="mt-1.5 rounded-md p-1.5 text-foreground/50 hover:bg-foreground/5 hover:text-foreground cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => tags.append({ key: "", value: "" })}
                className="flex w-fit items-center gap-1 text-sm font-medium text-foreground/60 hover:text-foreground cursor-pointer"
              >
                <Plus size={14} /> Add tag
              </button>
            </div>

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
