import { useState, useEffect, useRef, useCallback } from "react";
import { loadSettings, type TimerMode, type TimerSettings } from "./shared";

function getDuration(mode: TimerMode, s: TimerSettings): number {
  switch (mode) {
    case "pomodoro": return s.pomodoro * 60;
    case "short-break": return s.shortBreak * 60;
    case "long-break": return s.longBreak * 60;
  }
}

export function useTimer(onTimerComplete?: (mode: TimerMode) => void) {
  const [settings] = useState<TimerSettings>(loadSettings);
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(() => getDuration("pomodoro", loadSettings()));
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionDuration = useRef(getDuration("pomodoro", loadSettings()));
  const onCompleteRef = useRef(onTimerComplete);

  useEffect(() => {
    onCompleteRef.current = onTimerComplete;
  }, [onTimerComplete]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onCompleteRef.current?.(mode);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  useEffect(() => {
    if (timeLeft !== 0 || isRunning) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    let nextMode: TimerMode;
    if (mode === "pomodoro") {
      const nextCount = sessionCount + 1;
      setSessionCount(nextCount);
      nextMode =
        (nextCount - 1) % settings.sessionsBeforeLongBreak === 0
          ? "long-break"
          : "short-break";
    } else {
      nextMode = "pomodoro";
    }

    setMode(nextMode);
    const duration = getDuration(nextMode, settings);
    sessionDuration.current = duration;
    setTimeLeft(duration);

    if (settings.autoStart) setIsRunning(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [timeLeft, isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeMode = useCallback((m: TimerMode) => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode(m);
    const duration = getDuration(m, settings);
    sessionDuration.current = duration;
    setTimeLeft(duration);
  }, [settings]);

  const handleStartPause = () => {
    if (timeLeft === 0) {
      setTimeLeft(sessionDuration.current);
      setIsRunning(true);
    } else {
      setIsRunning((p) => !p);
    }
  };

  const adjustMinutes = (delta: number) => {
    if (isRunning) return;
    setTimeLeft((prev) => {
      const next = Math.max(60, prev + delta * 60);
      sessionDuration.current = next;
      return next;
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
