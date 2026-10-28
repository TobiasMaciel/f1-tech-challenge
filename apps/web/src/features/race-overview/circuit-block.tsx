import type { RaceDetailCircuit } from '@f1/shared';
import { CircuitTrack } from '@/components/circuit-track';
import { CountryFlag } from '@/components/country-flag';
import { InfoHint } from '@/components/info-hint';
import { formatDuration, formatPercent } from '@/lib/format';

const CIRCUIT_TYPES: Record<RaceDetailCircuit['type'], string> = {
  permanent: 'Permanente',
  street: 'Urbano',
  'semi-street': 'Semiurbano',
};

interface CircuitBlockProps {
  circuit: RaceDetailCircuit;
  laps: number;
  /** Seconds lost driving through the pit lane on each stop. */
  pitStopLoss: number;
  /** Seconds the tyre change adds to each stop. */
  tyreChangeTime: number;
}

export function CircuitBlock({ circuit, laps, pitStopLoss, tyreChangeTime }: CircuitBlockProps) {
  const facts = [
    { label: 'Tipo', value: CIRCUIT_TYPES[circuit.type] },
    { label: 'Largo', value: `${circuit.lengthKm.toFixed(3)} km` },
    { label: 'Vueltas', value: `${laps} vueltas` },
    {
      label: 'Vuelta base',
      value: formatDuration(circuit.baseLapTime),
      hint: 'Tiempo de vuelta de referencia del circuito; sobre él se suman los demás efectos.',
    },
    {
      label: 'Desgaste de neumáticos',
      value: `x${circuit.tyreWear.toFixed(2)}`,
      hint: 'Cuánto castiga el circuito a los neumáticos: multiplica la degradación por vuelta de cada compuesto.',
    },
    {
      label: 'Dificultad de adelantamiento',
      value: formatPercent(circuit.overtakingDifficulty),
      hint: 'Qué tan difícil es pasar a otro auto aquí. Solo informativa: la simulación no incluye rivales.',
    },
    {
      label: 'Pérdida en boxes',
      value: `${pitStopLoss} s + ${tyreChangeTime} s de cambio`,
      hint: 'Segundos que se pierden en cada parada: el paso por boxes más el cambio de neumáticos.',
    },
  ];

  return (
    <section aria-labelledby="circuit-title" className="space-y-4 rounded-lg border bg-card p-4">
      <h3 id="circuit-title" className="font-semibold">
        Circuito
      </h3>
      <CircuitTrack circuitId={circuit.id} className="h-36 w-full text-foreground/80" />
      <div>
        <p className="font-medium">{circuit.name}</p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CountryFlag country={circuit.country} />
          {circuit.country}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4 text-sm">
        {facts.map(({ label, value, hint }) => (
          <div key={label}>
            <dt className="flex items-center gap-1 text-xs text-muted-foreground">
              {label}
              {hint && <InfoHint term={label.toLowerCase()}>{hint}</InfoHint>}
            </dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
