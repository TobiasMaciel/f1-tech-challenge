import type { ForecastSegment } from '@f1/shared';
import { describeRain, getRainLevel } from '@/lib/rain';
import { cn } from '@/lib/utils';

/** Explains why a dry race still shows several segments. */
export const FORECAST_SEGMENTS_HINT =
  'El pronóstico llega dividido en tramos de vueltas, cada uno con su lluvia y temperatura; se muestran aunque el clima no cambie entre ellos.';

interface WeatherBarProps {
  forecast: ForecastSegment[];
  totalLaps: number;
  className?: string;
}

/** Horizontal bar of the race laps split into forecast segments; each segment is as wide as its share of laps. */
export function WeatherBar({ forecast, totalLaps, className }: WeatherBarProps) {
  return (
    <ul className={cn('flex h-12 w-full gap-px overflow-hidden rounded-md', className)}>
      {forecast.map((segment) => {
        const laps = segment.toLap - segment.fromLap + 1;
        const { label, className: colour } = getRainLevel(segment.rainIntensity);

        return (
          <li
            key={segment.fromLap}
            style={{ width: `${(laps / totalLaps) * 100}%` }}
            title={`Vueltas ${segment.fromLap}-${segment.toLap}: ${describeRain(segment.rainIntensity)}, ${segment.temperature} °C`}
            className={cn(
              '@container flex min-w-0 flex-col justify-center px-2 text-xs leading-4 text-white',
              colour,
            )}
          >
            <span className="truncate font-semibold tabular-nums">
              V{segment.fromLap}–{segment.toLap}
            </span>
            {/* A narrow segment shows only its laps; the level stays in the title and for screen readers. */}
            <span className="truncate text-white/85 @max-[6rem]:sr-only">{label}</span>
          </li>
        );
      })}
    </ul>
  );
}
