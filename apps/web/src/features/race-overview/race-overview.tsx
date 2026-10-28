import { ErrorAlert } from '@/components/error-alert';
import { LoadingNotice } from '@/components/loading-notice';
import { SectionHeading } from '@/components/section-heading';
import { useRaceDetail } from '@/hooks/use-race-detail';
import { CircuitBlock } from './circuit-block';
import { RisksLine } from './risks-line';
import { TyresBlock } from './tyres-block';
import { WeatherBlock } from './weather-block';

/** Step 2: the circuit, weather, tyres and risks of the selected race. */
export function RaceOverview({ raceId }: { raceId: string }) {
  const { data, error, isFetching, refetch } = useRaceDetail(raceId);
  const isLoading = isFetching && !data;

  return (
    <section aria-labelledby="race-overview-title" className="space-y-5">
      <SectionHeading
        step={2}
        id="race-overview-title"
        title={data ? data.race.name : 'Información de la carrera'}
        description="Revisa cuándo llueve y qué banda de lluvia aguanta cada compuesto antes de elegir neumáticos."
      />

      {isLoading && (
        <>
          <LoadingNotice loading={isLoading} />
          <div className="h-96 animate-pulse rounded-lg border bg-card" aria-busy="true" />
        </>
      )}

      {error && !isFetching && <ErrorAlert message={error.message} onRetry={() => refetch()} />}

      {data && (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <CircuitBlock
            circuit={data.circuit}
            laps={data.race.laps}
            pitStopLoss={data.simulationParameters.pitStopLoss}
            tyreChangeTime={data.simulationParameters.tyreChangeTime}
          />
          <div className="space-y-4">
            <WeatherBlock weather={data.weather} totalLaps={data.race.laps} />
            <TyresBlock tyres={data.tyres} />
            <RisksLine
              safetyCarProbability={data.simulationParameters.safetyCarProbability}
              lapTimeVariance={data.simulationParameters.lapTimeVariance}
            />
          </div>
        </div>
      )}
    </section>
  );
}
