import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Lets a wide table scroll sideways inside its card (bleeding to the card edges) and, while there is
 * more to the right, fades that edge and shows a short hint so the cut content does not look clipped.
 */
export function HorizontalScroll({ label, children }: { label: string; children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [hasMoreRight, setHasMoreRight] = useState(false);

  useEffect(() => {
    const element = scrollRef.current!;
    const update = () => {
      setOverflows(element.scrollWidth > element.clientWidth);
      setHasMoreRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 1);
    };
    update();
    element.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="-mx-4">
      <div className="relative">
        <div
          ref={scrollRef}
          // Focusable while it scrolls, so keyboard users can move it with the arrow keys.
          tabIndex={overflows ? 0 : undefined}
          role="region"
          aria-label={label}
          className="overflow-x-auto px-4 focus-visible:outline-2 focus-visible:outline-ring"
        >
          {children}
        </div>
        {hasMoreRight && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-card to-transparent"
          />
        )}
      </div>
      {overflows && (
        <p aria-hidden="true" className="px-4 pt-2 text-xs text-muted-foreground">
          Desliza para ver más →
        </p>
      )}
    </div>
  );
}
