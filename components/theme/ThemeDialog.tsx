"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { ArrowRight, Check, Palette as PaletteIcon, RotateCcw, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TOKEN_GROUPS, type Palette, type Theme, type Token } from "@/lib/themes";
import { applyTheme, useThemes } from "@/hooks/use-themes";

// <input type="color"> only speaks hex, so resolve any CSS color through a canvas.
let ctx: CanvasRenderingContext2D | null = null;
const hexCache = new Map<string, string>();
function toHex(color: string) {
  const cached = hexCache.get(color);
  if (cached) return cached;
  ctx ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx) return "#000000";
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = color; // invalid colors are ignored and stay black
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  const hex = "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
  hexCache.set(color, hex);
  return hex;
}

export function Swatches({ palette, className }: { palette: Palette; className?: string }) {
  return (
    <span className={cn("flex -space-x-1.5", className)}>
      {(["background", "primary", "accent", "foreground"] as const).map((k) => (
        <span
          key={k}
          className="size-4 rounded-full border border-black/10 ring-1 ring-white/20"
          style={{ background: palette[k] }}
        />
      ))}
    </span>
  );
}

function ColorField({
  token,
  value,
  onChange,
}: {
  token: Token;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label
        className="relative size-8 shrink-0 cursor-pointer rounded-md border shadow-xs"
        style={{ background: value }}
      >
        <input
          type="color"
          aria-label={`${token} color`}
          value={toHex(value)}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </label>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-muted-foreground">{token}</p>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="h-7 px-2 font-mono text-xs"
        />
      </div>
    </div>
  );
}

export function ThemeDialog({ children }: { children: ReactNode }) {
  const { presets, custom, active, setActive, saveTheme, deleteTheme, resetPreview } =
    useThemes();
  const { resolvedTheme, setTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";

  const [open, setOpen] = useState(false);
  const [base, setBase] = useState<Theme>(active); // theme being edited, untouched
  const [draft, setDraft] = useState<Theme>(active);
  const [name, setName] = useState("");

  const isCustom = custom.some((t) => t.id === base.id);
  const dirty = draft !== base;

  // Live preview while the dialog is open.
  useEffect(() => {
    if (open) applyTheme(draft);
  }, [open, draft]);

  const pick = (t: Theme) => {
    setBase(t);
    setDraft(t);
    setName(custom.some((c) => c.id === t.id) ? t.name : `${t.name} copy`);
  };

  const onOpenChange = (next: boolean) => {
    if (next) pick(active);
    else resetPreview();
    setOpen(next);
  };

  const setColor = (token: Token, value: string) =>
    setDraft((d) => ({ ...d, [mode]: { ...d[mode], [token]: value } }));

  const close = () => onOpenChange(false);

  const saveAsNew = () => {
    saveTheme({ ...draft, id: crypto.randomUUID(), name: name.trim() });
    toast.success(`Saved "${name.trim()}"`);
    close();
  };

  const saveChanges = () => {
    saveTheme({ ...draft, name: name.trim() || draft.name });
    toast.success("Theme updated");
    close();
  };

  const apply = () => {
    setActive(base.id);
    close();
  };

  const remove = () => {
    deleteTheme(base.id);
    toast(`Deleted "${base.name}"`);
    pick(presets[0]);
  };

  const themeButton = (t: Theme) => (
    <button
      key={t.id}
      onClick={() => pick(t)}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors cursor-pointer",
        t.id === base.id ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-muted",
      )}
    >
      <Swatches palette={t[mode]} />
      <span className="flex-1 truncate">{t.name}</span>
      {t.id === active.id && <Check className="size-3.5 text-muted-foreground" />}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <PaletteIcon className="size-4" /> Theme
          </DialogTitle>
          <DialogDescription>
            Pick a theme or customize every color. Changes preview live.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[220px_1fr] md:overflow-hidden">
          {/* Theme list */}
          <aside className="flex flex-col gap-4 border-b p-3 md:overflow-y-auto md:border-r md:border-b-0">
            <div>
              <p className="px-2.5 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Presets
              </p>
              {presets.map(themeButton)}
            </div>
            <div>
              <p className="px-2.5 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your themes
              </p>
              {custom.length === 0 && (
                <p className="px-2.5 text-xs text-muted-foreground">
                  None yet. Customize a theme and save it.
                </p>
              )}
              {custom.map(themeButton)}
            </div>
            <Link
              href="/themes"
              onClick={close}
              className="mt-auto flex items-center gap-1 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Browse all themes <ArrowRight className="size-3" />
            </Link>
          </aside>

          {/* Token editor */}
          <div className="flex flex-col gap-5 p-6 md:overflow-y-auto">
            <div className="flex items-center justify-between gap-3">
              <Tabs value={mode} onValueChange={setTheme}>
                <TabsList>
                  <TabsTrigger value="light">Light</TabsTrigger>
                  <TabsTrigger value="dark">Dark</TabsTrigger>
                </TabsList>
              </Tabs>
              {dirty && (
                <Button variant="ghost" size="sm" onClick={() => setDraft(base)}>
                  <RotateCcw /> Reset
                </Button>
              )}
            </div>

            {Object.entries(TOKEN_GROUPS).map(([group, tokens]) => (
              <section key={group}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tokens.map((token) => (
                    <ColorField
                      key={token}
                      token={token}
                      value={draft[mode][token]}
                      onChange={(v) => setColor(token, v)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t px-6 py-4 sm:flex-row sm:items-center">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Theme name"
            maxLength={40}
            className="h-9 sm:max-w-56"
          />
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            {isCustom && (
              <Button variant="ghost" onClick={remove} className="text-destructive">
                <Trash2 /> Delete
              </Button>
            )}
            <Button variant="outline" onClick={saveAsNew} disabled={!name.trim()}>
              Save as new
            </Button>
            {dirty && isCustom ? (
              <Button onClick={saveChanges}>Save changes</Button>
            ) : (
              <Button onClick={apply} disabled={dirty}>
                Apply
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
