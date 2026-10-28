import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface InfoHintProps {
  /** Term being explained; it names the button for screen readers. */
  term: string;
  /** One short line explaining the term. */
  children: string;
}

/** Small info icon that shows a one-line explanation on hover or keyboard focus. */
export function InfoHint({ term, children }: InfoHintProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={`Ayuda sobre ${term}`}
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Info className="size-3.5" aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}
