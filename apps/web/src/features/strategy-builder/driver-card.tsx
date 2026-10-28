import type { DriverWithTeam } from '@f1/shared';
import { InfoHint } from '@/components/info-hint';

interface DriverCardProps {
  driver: DriverWithTeam;
}

export function DriverCard({ driver }: DriverCardProps) {
  const stats = [
    {
      label: 'Ritmo',
      value: driver.pace,
      hint: 'Velocidad del piloto de 0 a 1; junto con el auto fija cuánto se acerca a la vuelta base.',
    },
    { label: 'Rendimiento del auto', value: driver.team.carPerformance },
    {
      label: 'Consistencia',
      value: driver.consistency,
      hint: 'Regularidad del piloto de 0 a 1. Solo informativa: no entra en la simulación.',
    },
  ];

  return (
    <article aria-label={`Ficha de ${driver.name}`} className="rounded-md bg-muted/50 p-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {driver.team.name}
      </p>
      <h3 className="font-semibold">
        {driver.name} <span className="text-muted-foreground">#{driver.number}</span>
      </h3>
      <dl className="mt-3 grid grid-cols-3 gap-3">
        {stats.map(({ label, value, hint }) => (
          <div key={label}>
            <dt className="flex items-center gap-1 text-xs leading-tight text-muted-foreground">
              {label}
              {hint && <InfoHint term={`${label.toLowerCase()} del piloto`}>{hint}</InfoHint>}
            </dt>
            <dd className="text-lg font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export function DriverCardSkeleton() {
  return <div className="h-28 animate-pulse rounded-md bg-muted/50" aria-busy="true" />;
}
