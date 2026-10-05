"use client";

import { Check, Palette, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThemeDialog } from "@/components/theme/ThemeDialog";
import { useThemes } from "@/hooks/use-themes";
import { paletteStyle, type Palette as PaletteT, type Theme } from "@/lib/themes";
import { cn } from "@/lib/utils";

// A tiny mock UI rendered with the palette's own CSS variables.
function PalettePreview({ palette, label }: { palette: PaletteT; label: string }) {
  return (
    <div
      style={paletteStyle(palette)}
      className="flex-1 rounded-lg border border-border bg-background p-2.5 text-foreground"
    >
      <div className="flex gap-2">
        <div className="w-1/4 space-y-1 rounded-md bg-sidebar p-1.5">
          <div className="h-1.5 rounded-full bg-sidebar-primary" />
          <div className="h-1.5 rounded-full bg-sidebar-accent" />
          <div className="h-1.5 rounded-full bg-sidebar-accent" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="rounded-md border border-border bg-card px-2 py-1.5 text-card-foreground">
            <p className="text-[10px] font-semibold leading-none">{label}</p>
            <p className="mt-1 text-[9px] leading-none text-muted-foreground">Muted text</p>
          </div>
          <div className="flex gap-1">
            <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground">
              Primary
            </span>
            <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-semibold text-accent-foreground">
              Accent
            </span>
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="h-1.5 flex-1 rounded-full"
                style={{ background: `var(--chart-${i})` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeCard({
  theme,
  active,
  onApply,
  onDelete,
}: {
  theme: Theme;
  active: boolean;
  onApply: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground transition-shadow hover:shadow-md",
        active && "ring-2 ring-primary",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate font-semibold">{theme.name}</h3>
        {active && (
          <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            <Check className="size-3" /> Active
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <PalettePreview palette={theme.light} label="Light" />
        <PalettePreview palette={theme.dark} label="Dark" />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={active ? "secondary" : "default"}
          disabled={active}
          onClick={onApply}
          className="flex-1"
        >
          {active ? "Applied" : "Apply"}
        </Button>
        {onDelete && (
          <Button size="sm" variant="ghost" aria-label="Delete theme" onClick={onDelete}>
            <Trash2 />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ThemesPage() {
  const { presets, custom, active, setActive, deleteTheme } = useThemes();

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-6 pb-24 font-sans">
      <div
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        data-aos="fade-up"
      >
        <div>
          <h1 className="text-3xl font-bold">Themes</h1>
          <p className="mt-1 text-muted-foreground">
            Every theme ships with a light and dark version. Pick one, or build your own.
          </p>
        </div>
        <ThemeDialog>
          <Button>
            <Palette /> Customize
          </Button>
        </ThemeDialog>
      </div>

      <section className="mb-12">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Default themes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((t) => (
            <ThemeCard
              key={t.id}
              theme={t}
              active={t.id === active.id}
              onApply={() => setActive(t.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Your themes
        </h2>
        {custom.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            You haven&apos;t saved any themes yet. Hit{" "}
            <span className="font-semibold text-foreground">Customize</span> to create one.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {custom.map((t) => (
              <ThemeCard
                key={t.id}
                theme={t}
                active={t.id === active.id}
                onApply={() => setActive(t.id)}
                onDelete={() => {
                  deleteTheme(t.id);
                  toast(`Deleted "${t.name}"`);
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
