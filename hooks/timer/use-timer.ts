import { useState, useEffect, useRef, useCallback } from "react";
import { type TimerMode, type SessionSettings, type TimerState } from "./shared";

function getDuration(mode: TimerMode, s: SessionSettings): number {
  switch (mode) {
    case "pomodoro": return s.pomodoroMinutes * 60;
    case "short-break": return s.shortBreakMinutes * 60;
    case "long-break": return s.longBreakMinutes * 60;
  }
}

export function useTimer(
  sessionKey: string,
  settings: SessionSettings,
  timerState: TimerState,
  onTimerStateChange: (state: TimerState) => void,
  onTimerComplete?: (mode: TimerMode) => void,
) {
  const [mode, setMode] = useState<TimerMode>(timerState.mode);
  const [timeLeft, setTimeLeft] = useState(timerState.remainingSeconds);
  const [isRunning, setIsRunning] = useState(timerState.isRunning);
  const [sessionCount, setSessionCount] = useState(timerState.pomodoroCount);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const durationAtStartRef = useRef(0);
  const sessionDuration = useRef(timerState.remainingSeconds);
  const settingsRef = useRef(settings);
  const onCompleteRef = useRef(onTimerComplete);
  const onStateChangeRef = useRef(onTimerStateChange);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    onCompleteRef.current = onTimerComplete;
  }, [onTimerComplete]);

  useEffect(() => {
    onStateChangeRef.current = onTimerStateChange;
  }, [onTimerStateChange]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    /* eslint-disable react-hooks/set-state-in-effect */
    setMode(timerState.mode);
    setTimeLeft(timerState.remainingSeconds);
    setIsRunning(timerState.isRunning);
    setSessionCount(timerState.pomodoroCount);
    /* eslint-enable react-hooks/set-state-in-effect */
    sessionDuration.current = timerState.remainingSeconds;
  }, [sessionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isRunning) return;

    startTimeRef.current = performance.now();
    durationAtStartRef.current = timeLeft;

    const tick = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(
        0,
        Math.round(durationAtStartRef.current - elapsed),
      );
      setTimeLeft(remaining);

      if (remaining <= 0) {
        setIsRunning(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onCompleteRef.current?.(mode);
      }
    };

    const onVisibilityChange = () => {
      if (!document.hidden) tick();
    };

    intervalRef.current = setInterval(tick, 200);
    tick();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isRunning, mode]);

  useEffect(() => {
    if (timeLeft !== 0 || isRunning) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    let nextMode: TimerMode;
    let nextCount = sessionCount;
    if (mode === "pomodoro") {
      nextCount = sessionCount + 1;
      setSessionCount(nextCount);
      nextMode =
        (nextCount - 1) % settings.longBreakInterval === 0
          ? "long-break"
          : "short-break";
    } else {
      nextMode = "pomodoro";
    }

    setMode(nextMode);
    const duration = getDuration(nextMode, settings);
    sessionDuration.current = duration;
    setTimeLeft(duration);

    onStateChangeRef.current?.({
      mode: nextMode,
      remainingSeconds: duration,
      pomodoroCount: nextCount,
      isRunning: false,
    });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [timeLeft, isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeMode = useCallback((m: TimerMode) => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode(m);
    const duration = getDuration(m, settingsRef.current);
    sessionDuration.current = duration;
    setTimeLeft(duration);
    onStateChangeRef.current?.({
      mode: m,
      remainingSeconds: duration,
      pomodoroCount: 1,
      isRunning: false,
    });
  }, []);

  const handleStartPause = () => {
    if (timeLeft === 0) {
      const dur = sessionDuration.current;
      setTimeLeft(dur);
      setIsRunning(true);
      onStateChangeRef.current?.({
        mode,
        remainingSeconds: dur,
        pomodoroCount: sessionCount,
        isRunning: true,
      });
    } else {
      const next = !isRunning;
      setIsRunning(next);
      onStateChangeRef.current?.({
        mode,
        remainingSeconds: timeLeft,
        pomodoroCount: sessionCount,
        isRunning: next,
      });
    }
  };

  const adjustMinutes = (delta: number) => {
    if (isRunning) return;
    const next = Math.max(60, timeLeft + delta * 60);
    sessionDuration.current = next;
    setTimeLeft(next);
    onStateChangeRef.current?.({
      mode,
      remainingSeconds: next,
      pomodoroCount: sessionCount,
      isRunning: false,
    });
  };

  const btnLabel = isRunning ? "PAUSE" : timeLeft === 0 ? "RESTART" : "START";

  return {
    mode,
    timeLeft,
    isRunning,
    sessionCount,
    btnLabel,
    changeMode,
    handleStartPause,
    adjustMinutes,
  };
}
