import type { RaceDetailSimulationParameters } from '@f1/shared';
import { TriangleAlert } from 'lucide-react';
import { InfoHint } from '@/components/info-hint';
import { formatPercent } from '@/lib/format';

type RisksLineProps = Pick<
  RaceDetailSimulationParameters,
  'safetyCarProbability' | 'lapTimeVariance'
>;

/** Safety car probability and lap time variability of the race. */
export function RisksLine({ safetyCarProbability, lapTimeVariance }: RisksLineProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden="true" />
      <p className="flex flex-wrap gap-x-6 gap-y-1">
        <span>
          <span className="text-muted-foreground">Probabilidad de safety car: </span>
          <span className="font-medium tabular-nums">{formatPercent(safetyCarProbability)}</span>
        </span>
        <span>
          <span className="text-muted-foreground">Variabilidad por vuelta: </span>
          <span className="font-medium tabular-nums">±{lapTimeVariance.toFixed(2)} s</span>
        </span>
      </p>
      <InfoHint term="el safety car y la variabilidad">
        Solo informativo: la simulación no incluye safety car ni variaciones al azar entre vueltas.
      </InfoHint>
    </div>
  );
}
