"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Layers, Trash2 } from "lucide-react";
import type { TaskStatus } from "./shared";
import {
  type Session,
  type SessionSettings,
  type Task,
  type TimerState,
  SESSIONS_KEY,
  ACTIVE_SESSION_KEY,
  STORAGE_KEY,
  DEFAULT_SESSION_SETTINGS,
  DEFAULT_TIMER_STATE,
  loadSettings,
} from "./shared";

function migrateTask(t: Record<string, unknown>): Task {
  if (t.status) {
    return t as unknown as Task;
  }
  return {
    id: String(t.id),
    title: String(t.title ?? ""),
    note: String(t.note ?? ""),
    status: t.completed ? "done" : ("todo" as TaskStatus),
  };
}

function migrateSessionTasks(session: Session): Session {
  return {
    ...session,
    tasks: session.tasks.map(migrateTask),
  };
}

function loadSessions(): Session[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      const sessions = (JSON.parse(raw) as Session[]).map(migrateSessionTasks);
      if (sessions.length > 0) return sessions;
    }
  } catch {
    /* ignore */
  }

  const sessions: Session[] = [];

  try {
    const oldTasksRaw = localStorage.getItem(STORAGE_KEY);
    const oldSettings = loadSettings();
    const oldTasks: Task[] = oldTasksRaw
      ? (JSON.parse(oldTasksRaw) as Record<string, unknown>[]).map(migrateTask)
      : [];

    sessions.push({
      id: crypto.randomUUID(),
      name: "My Session",
      settings: {
        pomodoroMinutes: oldSettings.pomodoro,
        shortBreakMinutes: oldSettings.shortBreak,
        longBreakMinutes: oldSettings.longBreak,
        longBreakInterval: oldSettings.sessionsBeforeLongBreak,
      },
      timerState: DEFAULT_TIMER_STATE,
      tasks: oldTasks,
    });
  } catch {
    sessions.push({
      id: crypto.randomUUID(),
      name: "My Session",
      settings: { ...DEFAULT_SESSION_SETTINGS },
      timerState: { ...DEFAULT_TIMER_STATE },
      tasks: [],
    });
  }

  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  return sessions;
}

function loadActiveSessionId(sessions: Session[]): string {
  if (typeof window === "undefined") return sessions[0]?.id ?? "";
  try {
    const saved = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (saved && sessions.some((s) => s.id === saved)) return saved;
  } catch {
    /* ignore */
  }
  return sessions[0]?.id ?? "";
}

export function useSessions() {
  // Start with empty state so server and client produce the same initial render.
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  );

  // Load from localStorage once on mount.
  useEffect(() => {
    const s = loadSessions();
    const id = loadActiveSessionId(s);
    setSessions(s);
    setActiveSessionIdState(id);
    setIsLoaded(true);
  }, []);

  const setActiveSessionId = useCallback((id: string) => {
    setActiveSessionIdState(id);
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
  }, []);

  const addSession = useCallback(
    (name: string) => {
      const globalSettings = loadSettings();
      const newSession: Session = {
        id: crypto.randomUUID(),
        name: name.trim(),
        settings: {
          pomodoroMinutes: globalSettings.pomodoro,
          shortBreakMinutes: globalSettings.shortBreak,
          longBreakMinutes: globalSettings.longBreak,
          longBreakInterval: globalSettings.sessionsBeforeLongBreak,
        },
        timerState: { ...DEFAULT_TIMER_STATE },
        tasks: [],
      };
      setSessions((prev) => {
        const next = [...prev, newSession];
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
        return next;
      });
      setActiveSessionId(newSession.id);
      toast("Session created", { icon: <Layers className="size-4" /> });
    },
    [setActiveSessionId],
  );

  const renameSession = useCallback((id: string, name: string) => {
    setSessions((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, name: name.trim() } : s));
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== id);
        if (remaining.length === 0) {
          const fresh: Session = {
            id: crypto.randomUUID(),
            name: "My Session",
            settings: { ...DEFAULT_SESSION_SETTINGS },
            timerState: { ...DEFAULT_TIMER_STATE },
            tasks: [],
          };
          setActiveSessionId(fresh.id);
          const next = [fresh];
          localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
          return next;
        }
        if (id === activeSessionId) {
          setActiveSessionId(remaining[0].id);
        }
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(remaining));
        return remaining;
      });
      toast("Session deleted", { icon: <Trash2 className="size-4" /> });
    },
    [activeSessionId, setActiveSessionId],
  );

  const updateSessionSettings = useCallback(
    (id: string, settings: Partial<SessionSettings>) => {
      setSessions((prev) => {
        const next = prev.map((s) =>
          s.id === id ? { ...s, settings: { ...s.settings, ...settings } } : s,
        );
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const updateSessionTasks = useCallback((id: string, tasks: Task[]) => {
    setSessions((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, tasks } : s));
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateSessionTimerState = useCallback(
    (id: string, timerState: Partial<TimerState>) => {
      setSessions((prev) => {
        const next = prev.map((s) =>
          s.id === id
            ? { ...s, timerState: { ...s.timerState, ...timerState } }
            : s,
        );
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const stopAllTimers = useCallback(() => {
    setSessions((prev) => {
      const next = prev.map((s) => ({
        ...s,
        timerState: { ...s.timerState, isRunning: false },
      }));
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return {
    sessions,
    activeSessionId,
    activeSession,
    isLoaded,
    setActiveSessionId,
    addSession,
    renameSession,
    deleteSession,
    updateSessionSettings,
    updateSessionTasks,
    updateSessionTimerState,
    stopAllTimers,
  };
}
