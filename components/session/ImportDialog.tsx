"use client";

import { useState, type DragEvent } from "react";
import { toast } from "sonner";
import { FileJson, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_IMPORT_BYTES, parseImport, type Session } from "@/hooks/timer/shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing: Session[];
  onImport: (sessions: Session[]) => void;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function ImportDialog({ open, onOpenChange, existing, onImport }: ImportDialogProps) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Session[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    setText("");
    setFileName(null);
    setParsed(null);
    setError(null);
    setDragging(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const check = (raw: string) => {
    if (!raw.trim()) {
      setParsed(null);
      setError(null);
      return;
    }
    try {
      setParsed(parseImport(raw));
      setError(null);
    } catch (e) {
      setParsed(null);
      setError((e as Error).message);
    }
  };

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    if (file.size > MAX_IMPORT_BYTES) {
      setParsed(null);
      setError("File is too large (max 2 MB).");
      return;
    }
    check(await file.text());
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    readFile(e.dataTransfer.files[0]);
  };

  const existingIds = new Set(existing.map((s) => s.id));
  const replacing = parsed?.filter((s) => existingIds.has(s.id)).length ?? 0;
  const taskCount = parsed?.reduce((n, s) => n + s.tasks.length, 0) ?? 0;

  const confirm = () => {
    if (!parsed) return;
    onImport(parsed);
    toast.success(`Imported ${plural(parsed.length, "session")}`, {
      icon: <Upload className="size-4" />,
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import sessions</DialogTitle>
          <DialogDescription>
            Restore a Fokus export. Sessions with the same ID are replaced; new ones are added.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="file"
          onValueChange={() => {
            setText("");
            setFileName(null);
            check("");
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger value="file">File</TabsTrigger>
            <TabsTrigger value="paste">Paste</TabsTrigger>
          </TabsList>

          <TabsContent value="file">
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-10 text-center text-sm transition-colors",
                dragging
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              <FileJson className="size-6" />
              <span className="font-semibold">
                {fileName ?? "Drop a .json file or click to browse"}
              </span>
              <span className="text-xs opacity-70">Max 2 MB</span>
              <input
                type="file"
                accept=".json,application/json"
                className="sr-only"
                onChange={(e) => {
                  readFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </TabsContent>

          <TabsContent value="paste">
            <Textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                check(e.target.value);
              }}
              placeholder='{ "app": "fokus", "version": 1, "sessions": [...] }'
              aria-label="Export JSON"
              className="h-40 resize-none font-mono text-xs"
            />
          </TabsContent>
        </Tabs>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        {parsed && (
          <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm animate-in fade-in-0 duration-200">
            <p className="font-semibold">
              {plural(parsed.length, "session")} · {plural(taskCount, "task")}
            </p>
            {replacing > 0 && (
              <p className="text-xs text-muted-foreground">
                {replacing} will replace {replacing === 1 ? "an existing session" : "existing sessions"}
              </p>
            )}
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {parsed.map((s) => s.name).join(", ")}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={confirm} disabled={!parsed}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
