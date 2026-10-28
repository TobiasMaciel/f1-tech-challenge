import type { Compound } from '@f1/shared';
import { getCompoundInfo } from '@/lib/compounds';
import { cn } from '@/lib/utils';

interface CompoundBadgeProps {
  compound: Compound;
  className?: string;
}

/** TV-style tyre icon: a ring in the official compound colour with its letter in the middle. */
export function CompoundBadge({ compound, className }: CompoundBadgeProps) {
  const { label, letter, color } = getCompoundInfo(compound);

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      style={{ borderColor: color }}
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-full border-[3px] bg-black text-xs font-bold text-white',
        className,
      )}
    >
      <span aria-hidden="true">{letter}</span>
    </span>
  );
}
