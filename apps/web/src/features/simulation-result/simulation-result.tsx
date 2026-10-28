import type { SimulationResponse } from '@f1/shared';
import { RefreshCw } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { useCountUp } from '@/hooks/use-count-up';
import { useRaceDetail } from '@/hooks/use-race-detail';
import { CompoundBadge } from '@/components/compound-badge';
import { EmptyState } from '@/components/empty-state';
import { HorizontalScroll } from '@/components/horizontal-scroll';
import { SectionHeading } from '@/components/section-heading';
import { getCompoundInfo } from '@/lib/compounds';
import { formatDuration, formatRaceTime, formatSignedSeconds } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { buildConclusion } from './conclusion';
import { PitStopsList } from './pit-stops-list';
import { TimeBreakdown } from './time-breakdown';

// The chart library is the heaviest dependency and only needed after a simulation, so it loads in its own chunk.
const LapTimeChart = lazy(() =>
  import('./lap-time-chart').then((module) => ({ default: module.LapTimeChart })),
);

interface SimulationResultProps {
  raceId: string;
  /** Undefined until the first simulation of the selected race. */
  result: SimulationResponse | undefined;
  /** The strategy changed after this result: it stays visible, dimmed, until the next simulation. */
  isStale: boolean;
}

const NUMBER_CELL = 'px-3 py-2.5 text-right';
const NUMBER_HEADER = 'px-3 py-2 text-right font-normal';

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

export function SimulationResult({ raceId, result, isStale }: SimulationResultProps) {
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
              </div>
              <TimeBreakdown key={result.totalTime} result={result} />
            </div>

            <div className="grid grid-cols-1 items-start gap-4 2xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <section
                aria-labelledby="stints-table-title"
                className="space-y-3 rounded-lg border bg-card p-4"
              >
                <h3 id="stints-table-title" className="font-semibold">
                  Stints
                </h3>
                <HorizontalScroll>
                  <table className="w-full min-w-[42rem] text-sm whitespace-nowrap tabular-nums">
                    <caption className="sr-only">Stints de la estrategia</caption>
                    <thead className="text-xs text-muted-foreground">
                      <tr>
                        <th className="py-2 pr-3 text-left font-normal">Stint</th>
                        <th className="px-3 py-2 text-left font-normal">Compuesto</th>
                        <th className={NUMBER_HEADER}>Vueltas</th>
                        <th className={NUMBER_HEADER}>Cantidad</th>
                        <th className={NUMBER_HEADER}>Tiempo</th>
                        <th className={NUMBER_HEADER}>Vuelta promedio</th>
                        <th className={NUMBER_HEADER}>Pérdida por degradación</th>
                        <th className={`${NUMBER_HEADER} pr-0`}>Pérdida por lluvia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.stints.map((stint) => (
                        <tr key={stint.number} className="border-t">
                          <td className="py-2.5 pr-3">{stint.number}</td>
                          <td className="px-3 py-2.5">
                            <span className="flex items-center gap-2">
                              <CompoundBadge compound={stint.compound} />
                              <span aria-hidden="true">
                                {getCompoundInfo(stint.compound).label}
                              </span>
                            </span>
                          </td>
                          <td className={NUMBER_CELL}>
                            {stint.startLap}–{stint.endLap}
                          </td>
                          <td className={NUMBER_CELL}>{stint.laps}</td>
                          <td className={NUMBER_CELL}>{formatDuration(stint.time)}</td>
                          <td className={NUMBER_CELL}>{formatDuration(stint.averageLapTime)}</td>
                          <td className={NUMBER_CELL}>
                            {formatSignedSeconds(stint.degradationLoss)}
                          </td>
                          <td className={`${NUMBER_CELL} pr-0`}>
                            {formatSignedSeconds(stint.weatherLoss)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </HorizontalScroll>
              </section>
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
