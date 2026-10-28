import type { Ref } from 'react';

interface SectionHeadingProps {
  /** Position of the section in the page flow, shown as "01", "02"... */
  step: number;
  id: string;
  title: string;
  /** One short line telling the user what to do in this section. */
  description?: string;
  /** Gives access to the title so the page can scroll to it and move the focus there. */
  titleRef?: Ref<HTMLHeadingElement>;
}

export function SectionHeading({ step, id, title, description, titleRef }: SectionHeadingProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-semibold text-red-500 tabular-nums" aria-hidden="true">
          {String(step).padStart(2, '0')}
        </span>
        <h2
          id={id}
          ref={titleRef}
          tabIndex={titleRef ? -1 : undefined}
          className="scroll-mt-4 text-xl font-semibold tracking-tight outline-none"
        >
          {title}
        </h2>
      </div>
      {description && <p className="pl-8 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
