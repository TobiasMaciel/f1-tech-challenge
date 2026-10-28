import type { SimulationResponse } from '@f1/shared';
import { InfoHint } from '@/components/info-hint';
import { formatDuration, formatRaceTime, formatSignedSeconds } from '@/lib/format';
import { summarizeTime } from './time-summary';

interface TimeBreakdownProps {
  result: SimulationResponse;
}

/** Each term of the lap time model as seconds gained or lost against the reference race. */
export function TimeBreakdown({ result }: TimeBreakdownProps) {
  const { reference, terms } = summarizeTime(result);
  const largest = Math.max(...terms.map((term) => Math.abs(term.seconds)));

  return (
    <section
      aria-labelledby="time-breakdown-title"
      className="space-y-3 rounded-lg border bg-card p-4"
    >
      <h3 id="time-breakdown-title" className="flex items-center gap-2 font-semibold">
        Dónde se fue el tiempo
        <InfoHint term="dónde se fue el tiempo">
          Cada término del tiempo de vuelta, y las paradas, sumados en toda la carrera y comparados
          con la vuelta base.
        </InfoHint>
      </h3>
      <p className="text-sm text-muted-foreground">
        Referencia: {result.laps.length} vueltas a la vuelta base ={' '}
        <span className="tabular-nums">{formatRaceTime(reference)}</span> (
        {formatDuration(reference / result.laps.length)} por vuelta). En rojo, el tiempo perdido
        frente a esa referencia; en verde, el ganado.
      </p>
      <ul className="space-y-2">
        {terms.map((term) => {
          const width = largest === 0 ? 0 : (Math.abs(term.seconds) / largest) * 100;
          return (
            <li
              key={term.key}
              className="grid grid-cols-[6.5rem_minmax(0,1fr)_4.5rem] items-center gap-3 text-sm"
            >
              <span>{term.label}</span>
              <span className="h-2 rounded-full bg-muted">
                <span
                  className={`block h-full origin-left rounded-full motion-safe:animate-[grow-x_500ms_ease-out] ${term.seconds > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${width}%` }}
                />
              </span>
              <span className="text-right tabular-nums">{formatSignedSeconds(term.seconds)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
