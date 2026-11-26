"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ban, ImagePlus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { uploadTaskImage } from "@/lib/task-images";
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
import { Popover as PopoverPrimitive } from "radix-ui";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TAG_COLOR_CLASS } from "@/components/session/BoardTaskCardContent";
import { cn } from "@/lib/utils";
import { TAG_COLORS, tagsSchema } from "@/hooks/timer/shared";

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

  // Images upload to Firestore, so they need an account.
  const { user } = useAuth();
  const noteRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);

  // Uploads each image and inserts its `![name](/img/id)` line at the cursor.
  const addImages = async (files: File[]) => {
    if (!user) return;
    for (const file of files) {
      setUploading((n) => n + 1);
      try {
        const line = await uploadTaskImage(file, user.uid);
        const note = form.getValues("note") ?? "";
        const at = noteRef.current?.selectionStart ?? note.length;
        const before = note.slice(0, at);
        const sep = before && !before.endsWith("\n") ? "\n" : "";
        form.setValue("note", `${before}${sep}${line}\n${note.slice(at)}`, { shouldDirty: true });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't upload the image.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

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
                      ref={(el) => {
                        field.ref(el);
                        noteRef.current = el;
                      }}
                      onPaste={(e) => {
                        const files = [...e.clipboardData.files].filter((f) => f.type.startsWith("image/"));
                        if (!files.length || !user) return;
                        e.preventDefault();
                        addImages(files);
                      }}
                      placeholder="Add any notes..."
                      rows={4}
                      className="resize-none bg-foreground/[0.04] border-foreground/15 focus-visible:ring-foreground/20 focus-visible:border-foreground/25"
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="flex items-center gap-2 text-xs text-foreground/50">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/heic"
                      multiple
                      hidden
                      onChange={(e) => {
                        addImages([...(e.target.files ?? [])]);
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={!user || uploading > 0}
                      title={user ? "Add image (or paste one into the note)" : "Sign in to add images"}
                      className="flex items-center gap-1 font-medium text-foreground/60 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {uploading > 0 ? <Spinner /> : <ImagePlus size={14} />}
                      {uploading > 0 ? "Uploading…" : "Add image"}
                    </button>
                    <span>{user ? "or paste one into the note" : "Sign in to add images"}</span>
                  </div>
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
                    name={`tags.${i}.color`}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger
                          aria-label={`Tag color: ${field.value ?? "none"}`}
                          title="Tag color"
                          className={cn(
                            "mt-1.5 size-7 shrink-0 rounded-md border border-dashed border-foreground/30 cursor-pointer",
                            field.value && [TAG_COLOR_CLASS[field.value], "border-solid"],
                          )}
                        />
                        <PopoverContent
                          align="start"
                          className="flex w-auto gap-1.5 p-2"
                          // Escape closes just the picker, not the whole task dialog (window listener above).
                          onKeyDown={(e) => e.key === "Escape" && e.stopPropagation()}
                        >
                          <PopoverPrimitive.Close
                            type="button"
                            onClick={() => field.onChange(undefined)}
                            aria-label="No color"
                            aria-pressed={!field.value}
                            className="flex size-6 items-center justify-center rounded-md border text-foreground/50 cursor-pointer aria-pressed:ring-2 aria-pressed:ring-foreground/40"
                          >
                            <Ban size={12} />
                          </PopoverPrimitive.Close>
                          {TAG_COLORS.map((c) => (
                            <PopoverPrimitive.Close
                              key={c}
                              type="button"
                              onClick={() => field.onChange(c)}
                              aria-label={c}
                              title={c}
                              aria-pressed={field.value === c}
                              className={cn(
                                "size-6 rounded-md border cursor-pointer aria-pressed:ring-2 aria-pressed:ring-foreground/40",
                                TAG_COLOR_CLASS[c],
                              )}
                            />
                          ))}
                        </PopoverContent>
                      </Popover>
                    )}
                  />
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
                disabled={uploading > 0}
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
