import { useEffect, useRef, useState } from 'react';

// Counts up in seconds. Pauses automatically when the browser tab loses visibility,
// resumes when it regains it. Call start() to begin, stop() to freeze and read the final value.
export function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const wasRunningBeforeHide = useRef(false);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        wasRunningBeforeHide.current = running;
        setRunning(false);
      } else if (wasRunningBeforeHide.current) {
        setRunning(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [running]);

  const start = () => setRunning(true);
  const pause = () => setRunning(false);
  const stop = () => {
    setRunning(false);
    return seconds;
  };
  const reset = () => {
    setRunning(false);
    setSeconds(0);
  };

  return { seconds, running, start, pause, stop, reset };
}
