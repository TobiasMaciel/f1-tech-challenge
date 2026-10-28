import type { RaceDetailResponse } from '@f1/shared';
import { InfoHint } from '@/components/info-hint';
import { FORECAST_SEGMENTS_HINT, WeatherBar } from '@/components/weather-bar';
import { describeRain, getRainLevel } from '@/lib/rain';
import { cn } from '@/lib/utils';

interface WeatherBlockProps {
  weather: RaceDetailResponse['weather'];
  totalLaps: number;
}

/** Race forecast as a bar aligned with the laps and as a table per segment. */
export function WeatherBlock({ weather, totalLaps }: WeatherBlockProps) {
  return (
    <section aria-labelledby="weather-title" className="space-y-4 rounded-lg border bg-card p-4">
      <div className="space-y-1">
        <h3 id="weather-title" className="flex items-center gap-1.5 font-semibold">
          Clima
          <InfoHint term="los tramos del clima">{FORECAST_SEGMENTS_HINT}</InfoHint>
        </h3>
        <p className="text-sm text-muted-foreground">{weather.summary}</p>
      </div>
      <WeatherBar forecast={weather.forecast} totalLaps={totalLaps} />
      <table className="w-full text-sm tabular-nums">
        <caption className="sr-only">Pronóstico por tramo de vueltas</caption>
        <thead className="text-left text-xs text-muted-foreground">
          <tr>
            <th className="pb-2 font-normal">Vueltas</th>
            <th className="pb-2 font-normal">Intensidad de lluvia (0–1)</th>
            <th className="pb-2 text-right font-normal">Temperatura</th>
          </tr>
        </thead>
        <tbody>
          {weather.forecast.map((segment) => (
            <tr key={segment.fromLap} className="border-t">
              <td className="py-1.5 pr-3 whitespace-nowrap">
                {segment.fromLap}–{segment.toLap}
              </td>
              <td className="py-1.5 pr-3">
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'size-2.5 shrink-0 rounded-sm',
                      getRainLevel(segment.rainIntensity).className,
                    )}
                    aria-hidden="true"
                  />
                  {describeRain(segment.rainIntensity)}
                </span>
              </td>
              <td className="py-1.5 text-right whitespace-nowrap">{segment.temperature} °C</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
