import { useState, useEffect, useRef, useCallback } from "react";
import { DURATIONS, type TimerMode } from "./shared";

export function useTimer(onTimerComplete?: (mode: TimerMode) => void) {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionDuration = useRef(DURATIONS.pomodoro);
  const onCompleteRef = useRef(onTimerComplete);
  onCompleteRef.current = onTimerComplete;

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (mode === "pomodoro") setSessionCount((c) => c + 1);
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

  const changeMode = useCallback((m: TimerMode) => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode(m);
    sessionDuration.current = DURATIONS[m];
    setTimeLeft(DURATIONS[m]);
  }, []);

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
