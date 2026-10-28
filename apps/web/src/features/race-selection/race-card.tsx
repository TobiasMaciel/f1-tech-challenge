import type { RaceSummary } from '@f1/shared';
import { CloudRain } from 'lucide-react';
import { CircuitTrack } from '@/components/circuit-track';
import { cn } from '@/lib/utils';
import { CountryFlag } from '@/components/country-flag';

interface RaceCardProps {
  race: RaceSummary;
  selected: boolean;
  onSelect: () => void;
}

// On phones the card is a compact row (track on the left); from `sm` up it is a vertical tile.
const CARD_LAYOUT =
  'grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-x-4 sm:flex sm:flex-col sm:items-stretch sm:gap-3';

export function RaceCard({ race, selected, onSelect }: RaceCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        CARD_LAYOUT,
        'cursor-pointer rounded-lg border bg-card p-3 text-left transition-colors hover:border-foreground/30 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none sm:p-4',
        selected && 'border-red-600 bg-muted/50 ring-1 ring-red-600 hover:border-red-600',
      )}
    >
      <CircuitTrack
        circuitId={race.circuit.id}
        className={cn(
          'size-16 sm:h-20 sm:w-full',
          selected ? 'text-foreground' : 'text-foreground/70',
        )}
      />
      <div className="min-w-0 space-y-1 sm:flex sm:flex-1 sm:flex-col">
        <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <CountryFlag country={race.circuit.country} />
          <span>Ronda {race.round}</span>
        </div>
        <h3 className="leading-tight font-semibold">{race.name}</h3>
        <p className="truncate text-xs text-muted-foreground sm:whitespace-normal">
          {race.circuit.name}
        </p>
        <dl className="flex items-center justify-between pt-1 text-sm tabular-nums sm:mt-auto sm:pt-2">
          <div className="flex gap-1">
            <dt className="sr-only">Vueltas</dt>
            <dd>{race.laps} vueltas</dd>
          </div>
          <div className="flex items-center gap-1.5 text-sky-400">
            <CloudRain className="size-4" aria-hidden="true" />
            <dt className="sr-only">Probabilidad de lluvia</dt>
            <dd>{Math.round(race.rainProbability * 100)}%</dd>
          </div>
        </dl>
      </div>
    </button>
  );
}

export function RaceCardSkeleton() {
  return (
    <div
      className={cn(CARD_LAYOUT, 'h-24 animate-pulse rounded-lg border bg-card p-3 sm:h-60 sm:p-4')}
    >
      <div className="size-16 rounded-md bg-muted sm:h-20 sm:w-full" />
      <div className="space-y-2">
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>
    </div>
  );
}
