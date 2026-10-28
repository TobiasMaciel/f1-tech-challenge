import { useEffect, useState } from 'react';

/** True once `active` has been true for `delayMs`; goes back to false as soon as `active` ends. */
export function useAfterDelay(active: boolean, delayMs: number) {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setElapsed(true), delayMs);
    return () => {
      clearTimeout(timer);
      setElapsed(false);
    };
  }, [active, delayMs]);

  return active && elapsed;
}
