import type { StintResult } from '@f1/shared';
import { CompoundBadge } from '@/components/compound-badge';
import { HorizontalScroll } from '@/components/horizontal-scroll';
import { getCompoundInfo } from '@/lib/compounds';
import { formatDuration, formatSignedSeconds } from '@/lib/format';

interface StintsTableProps {
  stints: StintResult[];
}

const NUMBER_CELL = 'px-3 py-2.5 text-right';
const NUMBER_HEADER = 'px-3 py-2 text-right font-normal';

/** Laps, time and losses of each stint of the simulated strategy. */
export function StintsTable({ stints }: StintsTableProps) {
  return (
    <section
      aria-labelledby="stints-table-title"
      className="space-y-3 rounded-lg border bg-card p-4"
    >
      <h3 id="stints-table-title" className="font-semibold">
        Stints
      </h3>
      <HorizontalScroll label="Tabla de stints">
        <table className="w-full min-w-[42rem] text-sm whitespace-nowrap tabular-nums">
          <caption className="sr-only">Stints de la estrategia</caption>
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="py-2 pr-3 text-left font-normal">Stint</th>
              <th className="px-3 py-2 text-left font-normal">Compuesto</th>
              <th className={NUMBER_HEADER}>Tramo</th>
              <th className={NUMBER_HEADER}>Vueltas</th>
              <th className={NUMBER_HEADER}>Tiempo</th>
              <th className={NUMBER_HEADER}>Vuelta promedio</th>
              <th className={NUMBER_HEADER}>Pérdida por degradación</th>
              <th className={`${NUMBER_HEADER} pr-0`}>Pérdida por lluvia</th>
            </tr>
          </thead>
          <tbody>
            {stints.map((stint) => (
              <tr key={stint.number} className="border-t">
                <td className="py-2.5 pr-3">{stint.number}</td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-2">
                    <CompoundBadge compound={stint.compound} />
                    <span aria-hidden="true">{getCompoundInfo(stint.compound).label}</span>
                  </span>
                </td>
                <td className={NUMBER_CELL}>
                  {stint.startLap}–{stint.endLap}
                </td>
                <td className={NUMBER_CELL}>{stint.laps}</td>
                <td className={NUMBER_CELL}>{formatDuration(stint.time)}</td>
                <td className={NUMBER_CELL}>{formatDuration(stint.averageLapTime)}</td>
                <td className={NUMBER_CELL}>{formatSignedSeconds(stint.degradationLoss)}</td>
                <td className={`${NUMBER_CELL} pr-0`}>{formatSignedSeconds(stint.weatherLoss)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </HorizontalScroll>
    </section>
  );
}
