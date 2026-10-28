/** True when the user asked the system for less motion; JS animations must check it, CSS ones use `motion-safe:`. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
