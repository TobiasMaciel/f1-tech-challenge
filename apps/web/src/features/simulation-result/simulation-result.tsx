import type { SimulationResponse } from '@f1/shared';
import { RefreshCw } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { EmptyState } from '@/components/empty-state';
import { SectionHeading } from '@/components/section-heading';
import { useCountUp } from '@/hooks/use-count-up';
import { useRaceDetail } from '@/hooks/use-race-detail';
import type { SimulationRun } from '@/hooks/use-simulation';
import { formatRaceTime } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { compareSimulations } from './compare-simulations';
import { buildConclusion } from './conclusion';
import { PitStopsList } from './pit-stops-list';
import { PreviousComparison } from './previous-comparison';
import { StintsTable } from './stints-table';
import { TimeBreakdown } from './time-breakdown';

// The chart library is the heaviest dependency and only needed after a simulation, so it loads in its own chunk.
const LapTimeChart = lazy(() =>
  import('./lap-time-chart').then((module) => ({ default: module.LapTimeChart })),
);

interface SimulationResultProps {
  raceId: string;
  /** Undefined until the first simulation of the selected race. */
  result: SimulationResponse | undefined;
  /** The simulation before this one in the same race; undefined until there are two. */
  previous: SimulationRun | undefined;
  /** Driver of this result, to tell whether the previous one used another. */
  currentDriverId: string | undefined;
  /** The strategy changed after this result: it stays visible, dimmed, until the next simulation. */
  isStale: boolean;
}

/** The total counts up for the eyes; screen readers get the final time only. */
function TotalTime({ seconds }: { seconds: number }) {
  const shown = useCountUp(seconds, 500);

  return (
    <p className="text-4xl font-bold tracking-tight tabular-nums">
      <span className="sr-only">{formatRaceTime(seconds)}</span>
      <span aria-hidden="true">{formatRaceTime(shown)}</span>
    </p>
  );
}

/** Step 4: total time, where it went, stints, pit stops and lap chart of the last simulation. */
export function SimulationResult({
  raceId,
  result,
  previous,
  currentDriverId,
  isStale,
}: SimulationResultProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { data: raceDetail } = useRaceDetail(raceId);

  // A new result brings the user to it: scroll (smooth unless they prefer less motion) and move the focus to the title.
  useEffect(() => {
    if (!result) return;
    titleRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
    titleRef.current?.focus({ preventScroll: true });
  }, [result]);

  const comparison =
    result && previous ? { previous, ...compareSimulations(result, previous.result) } : undefined;

  return (
    <section aria-labelledby="simulation-result-title" className="space-y-5">
      <SectionHeading
        step={4}
        id="simulation-result-title"
        title="Resultado de la simulación"
        titleRef={titleRef}
      />

      {!result ? (
        // Until the race loads (or if it fails) there are no stints to complete yet.
        raceDetail && (
          <EmptyState>
            Completa los stints hasta cubrir todas las vueltas y pulsa Simular para ver el tiempo
            total y su desglose.
          </EmptyState>
        )
      ) : (
        <>
          {isStale && (
            <p
              role="status"
              className="flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-sm"
            >
              <RefreshCw className="size-4 shrink-0 text-amber-400" aria-hidden="true" />
              Cambiaste la estrategia: simula de nuevo para actualizar el resultado.
            </p>
          )}
          <div className={cn('space-y-5 transition-opacity duration-300', isStale && 'opacity-40')}>
            <p className="max-w-3xl pl-8 text-base">{buildConclusion(result)}</p>
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <div className="rounded-lg border border-l-4 border-l-red-600 bg-card p-4">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Tiempo total
                </p>
                <TotalTime seconds={result.totalTime} />
                <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                  {result.laps.length} vueltas · {result.stints.length} stints ·{' '}
                  {result.pitStops.length === 1 ? '1 parada' : `${result.pitStops.length} paradas`}
                </p>
                {comparison && (
                  <PreviousComparison
                    totalDelta={comparison.totalDelta}
                    previous={comparison.previous}
                    currentDriverId={currentDriverId}
                  />
                )}
              </div>
              {/* A new total remounts the breakdown so its bars animate again; an identical re-run keeps them still. */}
              <TimeBreakdown key={result.totalTime} result={result} deltas={comparison?.terms} />
            </div>

            <div className="grid grid-cols-1 items-start gap-4 2xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <StintsTable stints={result.stints} />
              <PitStopsList pitStops={result.pitStops} />
            </div>

            <Suspense
              fallback={
                <div className="h-96 animate-pulse rounded-lg border bg-card" aria-busy="true" />
              }
            >
              <LapTimeChart result={result} />
            </Suspense>
          </div>
        </>
      )}
    </section>
  );
}
