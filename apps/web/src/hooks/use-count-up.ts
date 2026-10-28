import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Counts up to `target` in `durationMs` (ease-out). The first time it starts from 0; when `target`
 * changes it starts from the value on screen, so a small change is visible.
 * With reduced motion it returns `target` right away.
 */
export function useCountUp(target: number, durationMs: number): number {
  const reduceMotion = prefersReducedMotion();
  const [value, setValue] = useState(0);
  const shownRef = useRef(0);

  useEffect(() => {
    if (reduceMotion) return;
    const from = shownRef.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      shownRef.current = from + (target - from) * (1 - (1 - progress) ** 3);
      setValue(shownRef.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, reduceMotion]);

  return reduceMotion ? target : value;
}
