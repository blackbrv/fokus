"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import { Layers, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { fromSnapshot, sessionsCol, syncToCloud } from "./cloud";
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
  mergeSessions,
  trackTaskChanges,
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

export function loadSessions(): Session[] {
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

  const { user, loading: authLoading } = useAuth();
  const uid = user?.uid ?? null;
  const uidRef = useRef<string | null>(null);

  /** Persists a state transition: Firestore when signed in, localStorage for guests. */
  const commit = useCallback((prev: Session[], next: Session[]) => {
    const cloudUid = uidRef.current;
    if (cloudUid) {
      syncToCloud(cloudUid, prev, next).catch(() =>
        toast.error("Couldn't sync your changes. They'll stay on this device."),
      );
    } else {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
    }
    return next;
  }, []);

  // Signed in: live Firestore snapshot (works offline from the IndexedDB cache).
  // Guest: localStorage, as before. Re-runs on sign-in / sign-out.
  useEffect(() => {
    if (authLoading) return;
    uidRef.current = uid;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!uid) {
      const s = loadSessions();
      setSessions(s);
      setActiveSessionIdState(loadActiveSessionId(s));
      setIsLoaded(true);
      return;
    }
    setIsLoaded(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    return onSnapshot(
      sessionsCol(uid),
      { includeMetadataChanges: true },
      (snap) => {
        // An empty local cache isn't an answer yet; wait for the server.
        if (snap.empty && snap.metadata.fromCache) return;
        const s = fromSnapshot(snap);
        setSessions(s);
        setActiveSessionIdState((cur) => (s.some((x) => x.id === cur) ? cur : loadActiveSessionId(s)));
        setIsLoaded(true);
      },
      () => {
        toast.error("Couldn't load your sessions from the cloud.");
        setIsLoaded(true);
      },
    );
  }, [uid, authLoading]);

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
        return commit(prev, next);
      });
      setActiveSessionId(newSession.id);
      toast("Session created", { icon: <Layers className="size-4" /> });
    },
    [setActiveSessionId, commit],
  );

  const renameSession = useCallback((id: string, name: string) => {
    setSessions((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, name: name.trim() } : s));
      return commit(prev, next);
    });
  }, [commit]);

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
          return commit(prev, [fresh]);
        }
        if (id === activeSessionId) {
          setActiveSessionId(remaining[0].id);
        }
        return commit(prev, remaining);
      });
      toast("Session deleted", { icon: <Trash2 className="size-4" /> });
    },
    [activeSessionId, setActiveSessionId, commit],
  );

  const updateSessionSettings = useCallback(
    (id: string, settings: Partial<SessionSettings>) => {
      setSessions((prev) => {
        const next = prev.map((s) =>
          s.id === id ? { ...s, settings: { ...s.settings, ...settings } } : s,
        );
        return commit(prev, next);
      });
    },
    [commit],
  );

  const updateSessionTasks = useCallback((id: string, tasks: Task[]) => {
    setSessions((prev) => {
      const next = prev.map((s) =>
        s.id === id ? { ...s, tasks: trackTaskChanges(s.tasks, tasks) } : s,
      );
      return commit(prev, next);
    });
  }, [commit]);

  const updateSessionTimerState = useCallback(
    (id: string, timerState: Partial<TimerState>) => {
      setSessions((prev) => {
        const next = prev.map((s) =>
          s.id === id
            ? { ...s, timerState: { ...s.timerState, ...timerState } }
            : s,
        );
        return commit(prev, next);
      });
    },
    [commit],
  );

  /** Restores sessions as-is (history untouched): same id replaces, new ids append. */
  const importSessions = useCallback((incoming: Session[]) => {
    setSessions((prev) => {
      const next = mergeSessions(prev, incoming);
      return commit(prev, next);
    });
  }, [commit]);

  const stopAllTimers = useCallback(() => {
    setSessions((prev) => {
      const next = prev.map((s) =>
        s.timerState.isRunning ? { ...s, timerState: { ...s.timerState, isRunning: false } } : s,
      );
      return commit(prev, next);
    });
  }, [commit]);

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
    importSessions,
    stopAllTimers,
  };
}
