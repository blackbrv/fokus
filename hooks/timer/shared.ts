import { format, isThisYear, isToday, isYesterday } from "date-fns";
import { z } from "zod";

export type TimerMode = "pomodoro" | "short-break" | "long-break";

export type TaskStatus = "todo" | "in-progress" | "done";

export type TaskEvent =
  | { at: number; type: "created" }
  | { at: number; type: "renamed"; from: string; to: string }
  | { at: number; type: "note"; change: "added" | "edited" | "removed" }
  | { at: number; type: "status"; from: TaskStatus; to: TaskStatus };

export type Task = {
  id: string;
  title: string;
  note: string;
  status: TaskStatus;
  /** Missing on tasks created before activity tracking existed. */
  createdAt?: number;
  history?: TaskEvent[];
};

// ponytail: keeps the newest 50 events per task; raise if anyone needs older history.
const MAX_HISTORY = 50;

/**
 * Stamps new tasks and appends history events for whatever changed between
 * `prev` and `next`. Reordering alone records nothing.
 */
export function trackTaskChanges(prev: Task[], next: Task[], now = Date.now()): Task[] {
  const before = new Map(prev.map((t) => [t.id, t]));
  return next.map((t) => {
    const old = before.get(t.id);
    if (!old) {
      return { ...t, createdAt: t.createdAt ?? now, history: [{ at: now, type: "created" }] };
    }
    const events: TaskEvent[] = [];
    if (old.title !== t.title) events.push({ at: now, type: "renamed", from: old.title, to: t.title });
    if (old.note !== t.note) {
      const change = !old.note ? "added" : !t.note ? "removed" : "edited";
      events.push({ at: now, type: "note", change });
    }
    if (old.status !== t.status) events.push({ at: now, type: "status", from: old.status, to: t.status });
    if (events.length === 0) return t;
    return { ...t, history: [...(old.history ?? []), ...events].slice(-MAX_HISTORY) };
  });
}

export const MODES: TimerMode[] = ["pomodoro", "short-break", "long-break"];

export const DURATIONS: Record<TimerMode, number> = {
  pomodoro: 25 * 60,
  "short-break": 5 * 60,
  "long-break": 15 * 60,
};

export const MODE_LABELS: Record<TimerMode, string> = {
  pomodoro: "Pomodoro",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

export const STORAGE_KEY = "fokus-tasks";

export const SETTINGS_KEY = "fokus-settings";

export const SESSIONS_KEY = "fokus-sessions";
export const ACTIVE_SESSION_KEY = "fokus-active-session";

export interface SessionSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

export interface TimerState {
  mode: TimerMode;
  remainingSeconds: number;
  pomodoroCount: number;
  isRunning: boolean;
}

export type Session = {
  id: string;
  name: string;
  settings: SessionSettings;
  timerState: TimerState;
  tasks: Task[];
};

export const DEFAULT_SESSION_SETTINGS: SessionSettings = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
};

export const DEFAULT_TIMER_STATE: TimerState = {
  mode: "pomodoro",
  remainingSeconds: 25 * 60,
  pomodoroCount: 1,
  isRunning: false,
};

export interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  sessionsBeforeLongBreak: number;
  autoStart: boolean;
}

export const DEFAULT_SETTINGS: TimerSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLongBreak: 4,
  autoStart: false,
};

export function loadSettings(): TimerSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** "Today, 14:32" / "Yesterday, 09:10" / "Oct 3, 14:32" / "Oct 3, 2025, 14:32". */
export function formatTaskTime(ts: number): string {
  const d = new Date(ts);
  const time = format(d, "HH:mm");
  if (isToday(d)) return `Today, ${time}`;
  if (isYesterday(d)) return `Yesterday, ${time}`;
  return format(d, isThisYear(d) ? "MMM d, HH:mm" : "MMM d, yyyy, HH:mm");
}

// ── Export / import ─────────────────────────────────────────────────────────

const statusSchema = z.enum(["todo", "in-progress", "done"]);
const count = z.number().int().nonnegative();

const sessionSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  settings: z.object({
    pomodoroMinutes: count.min(1),
    shortBreakMinutes: count.min(1),
    longBreakMinutes: count.min(1),
    longBreakInterval: count.min(1),
  }),
  timerState: z.object({
    mode: z.enum(["pomodoro", "short-break", "long-break"]),
    remainingSeconds: count,
    pomodoroCount: count,
    isRunning: z.boolean(),
  }),
  tasks: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string(),
      note: z.string().default(""),
      status: statusSchema,
      createdAt: z.number().optional(),
      history: z
        .array(
          z.discriminatedUnion("type", [
            z.object({ at: z.number(), type: z.literal("created") }),
            z.object({ at: z.number(), type: z.literal("renamed"), from: z.string(), to: z.string() }),
            z.object({ at: z.number(), type: z.literal("note"), change: z.enum(["added", "edited", "removed"]) }),
            z.object({ at: z.number(), type: z.literal("status"), from: statusSchema, to: statusSchema }),
          ]),
        )
        .optional(),
    }),
  ),
});

const exportSchema = z.union([
  z.object({
    app: z.literal("fokus"),
    version: z.literal(1),
    exportedAt: z.number(),
    sessions: z.array(sessionSchema).min(1),
  }),
  // Also accept a raw "fokus-sessions" localStorage value.
  z.array(sessionSchema).min(1),
]);

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

export function buildExport(sessions: Session[]) {
  const label =
    sessions.length === 1
      ? sessions[0].name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "session"
      : "all";
  return {
    filename: `fokus-${label}-${format(new Date(), "yyyy-MM-dd")}.json`,
    json: JSON.stringify({ app: "fokus", version: 1, exportedAt: Date.now(), sessions }, null, 2),
  };
}

/** Parses an export file. Throws an Error with a user-facing message. */
export function parseImport(text: string): Session[] {
  if (text.length > MAX_IMPORT_BYTES) throw new Error("File is too large (max 2 MB).");
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("That isn't valid JSON.");
  }
  const result = exportSchema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue.path.length ? ` at ${issue.path.join(".")}` : "";
    throw new Error(`Not a Fokus export: ${issue.message}${where}.`);
  }
  const sessions = Array.isArray(result.data) ? result.data : result.data.sessions;
  // Last one wins on duplicate ids; never import a running timer.
  const unique = new Map(sessions.map((s) => [s.id, s]));
  return [...unique.values()].map((s) => ({ ...s, timerState: { ...s.timerState, isRunning: false } }));
}

/** Sessions with a matching id are replaced in place; new ones are appended. */
export function mergeSessions(existing: Session[], incoming: Session[]): Session[] {
  const byId = new Map(incoming.map((s) => [s.id, s]));
  const existingIds = new Set(existing.map((s) => s.id));
  return [
    ...existing.map((s) => byId.get(s.id) ?? s),
    ...incoming.filter((s) => !existingIds.has(s.id)),
  ];
}

export function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
