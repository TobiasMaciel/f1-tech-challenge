import { getCompoundInfo } from '@/lib/compounds';
import { cn } from '@/lib/utils';
import type { RainBandWarning } from './rain-band-warnings';
import { layoutStints, type StintRow } from './stint-layout';
import { placeStopLabels } from './stop-labels';

interface StrategyBarProps {
  rows: StintRow[];
  totalLaps: number;
  /** Laps drawn hatched because the compound is out of its rain band: red above it, amber below. */
  warnings: RainBandWarning[];
}

const HATCH: Record<RainBandWarning['side'], string> = {
  above:
    'border-red-600 bg-[repeating-linear-gradient(135deg,rgb(185_28_28/0.8)_0_3px,transparent_3px_9px)]',
  below:
    'border-amber-400 bg-[repeating-linear-gradient(135deg,rgb(251_191_36/0.6)_0_3px,transparent_3px_9px)]',
};

/** One block per stint, as wide as its share of the race laps, so it lines up with the weather bar above. */
export function StrategyBar({ rows, totalLaps, warnings }: StrategyBarProps) {
  const stints = layoutStints(rows, totalLaps);
  const toPercent = (laps: number) => (laps / totalLaps) * 100;

  const stopStints = stints.slice(0, -1);
  const labelLines = placeStopLabels(stopStints.map((stint) => toPercent(stint.endLap)));
  const stops = stopStints.map((stint, index) => ({
    id: stint.id,
    lap: stint.endLap,
    percent: toPercent(stint.endLap),
    line: labelLines[index],
  }));
  const lines = stops.some((stop) => stop.line === 1) ? 2 : 1;

  return (
    <div className="w-full">
      <div className="relative">
        <ul className="flex h-10 w-full gap-px overflow-hidden rounded-md bg-muted">
          {stints.map((stint) => {
            const { label, letter, color } = getCompoundInfo(stint.compound);
            return (
              <li
                key={stint.id}
                style={{ width: `${toPercent(stint.laps)}%`, backgroundColor: color }}
                title={`${label}: ${stint.laps} vueltas`}
                className="flex min-w-0 items-center justify-center text-sm font-bold text-black"
              >
                {/* Solid backing in the compound colour keeps the letter readable over the hatching. */}
                <span
                  style={{ backgroundColor: color }}
                  className="relative z-10 rounded-sm px-1.5 leading-5"
                >
                  {letter}
                </span>
              </li>
            );
          })}
        </ul>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {warnings.map((warning) => (
            <span
              key={`${warning.stint}-${warning.fromLap}`}
              style={{
                left: `${toPercent(warning.fromLap - 1)}%`,
                width: `${toPercent(warning.toLap - warning.fromLap + 1)}%`,
              }}
              className={cn('absolute inset-y-0 border-y-2', HATCH[warning.side])}
            />
          ))}
        </div>
      </div>
      {stops.length > 0 && (
        <ul
          aria-label="Paradas en boxes"
          className={cn(
            'relative text-xs text-muted-foreground tabular-nums',
            lines === 2 ? 'h-10' : 'h-6',
          )}
        >
          {stops.map((stop) => (
            <li
              key={stop.id}
              title={`Parada tras la vuelta ${stop.lap}`}
              style={{ left: `${stop.percent}%` }}
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
            >
              <span className={cn('w-px bg-foreground/40', stop.line === 1 ? 'h-6' : 'h-1.5')} />
              {/* A stop too close to the previous labels keeps only its tick; screen readers still get the lap. */}
              <span className={cn(stop.line === null && 'sr-only')}>V{stop.lap}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
