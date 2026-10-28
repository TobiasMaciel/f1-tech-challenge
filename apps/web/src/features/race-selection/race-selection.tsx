import { ErrorAlert } from '@/components/error-alert';
import { LoadingNotice } from '@/components/loading-notice';
import { SectionHeading } from '@/components/section-heading';
import { RaceCard, RaceCardSkeleton } from './race-card';
import { useRaces } from './use-races';

interface RaceSelectionProps {
  selectedRaceId: string | null;
  onSelectRace: (raceId: string) => void;
}

const GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7';

/** Step 1: the season races as cards; choosing one opens the rest of the page. */
export function RaceSelection({ selectedRaceId, onSelectRace }: RaceSelectionProps) {
  const { data, error, isFetching, refetch } = useRaces();
  const isLoading = isFetching && !data;

  return (
    <section aria-labelledby="race-selection-title" className="space-y-5">
      <SectionHeading
        step={1}
        id="race-selection-title"
        title="Elige una carrera"
        description={
          selectedRaceId
            ? undefined
            : 'Al elegirla verás el circuito, el clima y los neumáticos, y podrás armar tu estrategia.'
        }
      />

      {isLoading && (
        <>
          <LoadingNotice loading={isLoading} />
          <div className={GRID} aria-busy="true">
            {Array.from({ length: 7 }, (_, index) => (
              <RaceCardSkeleton key={index} />
            ))}
          </div>
        </>
      )}

      {error && !isFetching && <ErrorAlert message={error.message} onRetry={() => refetch()} />}

      {data && (
        <div className={GRID}>
          {data.races.map((race) => (
            <RaceCard
              key={race.id}
              race={race}
              selected={race.id === selectedRaceId}
              onSelect={() => onSelectRace(race.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
