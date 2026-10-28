import { Popover } from '@base-ui/react/popover';
import { Info } from 'lucide-react';

interface InfoHintProps {
  /** Term being explained; it names the button for screen readers. */
  term: string;
  /** One short line explaining the term. */
  children: string;
}

/** Small info icon that shows a one-line explanation on hover, tap, or Enter from the keyboard. */
export function InfoHint({ term, children }: InfoHintProps) {
  // A popover rather than a tooltip: tooltips only open on hover or focus, so phones could never show them.
  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={0}
        aria-label={`Ayuda sobre ${term}`}
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Info className="size-3.5" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" sideOffset={6} className="isolate z-50">
          <Popover.Popup
            role="tooltip"
            initialFocus={false}
            className="z-50 w-fit max-w-xs origin-(--transform-origin) rounded-md bg-foreground px-3 py-1.5 text-xs text-background data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          >
            {children}
            <Popover.Arrow className="size-2.5 rotate-45 rounded-[2px] bg-foreground data-[side=bottom]:-top-1 data-[side=top]:-bottom-1" />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
