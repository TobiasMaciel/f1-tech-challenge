import { CompoundBadge } from '@/components/compound-badge';
import { useDrivers } from '@/hooks/use-drivers';
import type { SimulationRun } from '@/hooks/use-simulation';
import { formatSignedSeconds } from '@/lib/format';
import { cn } from '@/lib/utils';

interface PreviousComparisonProps {
  /** Seconds, current minus previous. */
  totalDelta: number;
  previous: SimulationRun;
  currentDriverId: string | undefined;
}

/** Under the total time: how much faster or slower this simulation is, and the strategy it is compared with. */
export function PreviousComparison({
  totalDelta,
  previous,
  currentDriverId,
}: PreviousComparisonProps) {
  const { data } = useDrivers();
  const previousDriver =
    previous.request.driverId !== currentDriverId
      ? data?.drivers.find((driver) => driver.id === previous.request.driverId)
      : undefined;

  return (
    <div className="mt-3 space-y-1.5 border-t pt-3 text-sm">
      <p
        className={cn(
          'font-medium tabular-nums',
          totalDelta < 0 && 'text-emerald-400',
          totalDelta > 0 && 'text-red-400',
          totalDelta === 0 && 'font-normal text-muted-foreground',
        )}
      >
        {totalDelta === 0
          ? 'Mismo tiempo que la anterior'
          : `${formatSignedSeconds(totalDelta, 3)} frente a la anterior`}
      </p>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground tabular-nums">
        <span>Anterior:</span>
        {previous.request.stints.map((stint, index) => (
          <span key={index} className="flex items-center gap-1">
            <CompoundBadge compound={stint.compound} className="size-5 border-2 text-[10px]" />
            {stint.laps}
          </span>
        ))}
        {previousDriver && <span>· {previousDriver.name}</span>}
      </p>
    </div>
  );
}
