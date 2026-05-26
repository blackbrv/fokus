export type TimerMode = "pomodoro" | "short-break" | "long-break";

export type TaskStatus = "todo" | "in-progress" | "done";

export type Task = {
  id: string;
  title: string;
  note: string;
  status: TaskStatus;
};

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

export function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
