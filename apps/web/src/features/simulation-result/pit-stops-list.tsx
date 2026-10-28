import type { PitStopResult } from '@f1/shared';
import { ArrowRight } from 'lucide-react';
import { CompoundBadge } from '@/components/compound-badge';

interface PitStopsListProps {
  pitStops: PitStopResult[];
}

export function PitStopsList({ pitStops }: PitStopsListProps) {
  return (
    <section aria-labelledby="pit-stops-title" className="space-y-3 rounded-lg border bg-card p-4">
      <h3 id="pit-stops-title" className="font-semibold">
        Paradas
      </h3>
      {pitStops.length === 0 ? (
        <p className="text-sm text-muted-foreground">La estrategia no hace paradas.</p>
      ) : (
        <ul>
          {pitStops.map((stop) => (
            <li
              key={stop.afterLap}
              className="flex items-center gap-2 border-t py-2 text-sm first:border-t-0 first:pt-0"
            >
              <span className="flex items-center gap-1.5">
                <CompoundBadge compound={stop.fromCompound} />
                <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                <CompoundBadge compound={stop.toCompound} />
              </span>
              <span className="tabular-nums">Tras la vuelta {stop.afterLap}</span>
              <span className="ml-auto text-muted-foreground tabular-nums">
                {stop.timeLost.toFixed(1)} s perdidos
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
