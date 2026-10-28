import { simulationRequestSchema, type SimulationRequest } from '@f1/shared';
import { useState } from 'react';
import { ErrorAlert } from '@/components/error-alert';
import { InfoHint } from '@/components/info-hint';
import { LoadingNotice } from '@/components/loading-notice';
import { SectionHeading } from '@/components/section-heading';
import { FORECAST_SEGMENTS_HINT, WeatherBar } from '@/components/weather-bar';
import { useRaceDetail } from '@/hooks/use-race-detail';
import type { ApiError } from '@/lib/api-client';
import { DriverCard, DriverCardSkeleton } from './driver-card';
import { DriverPicker } from './driver-picker';
import { toRowErrors } from './row-errors';
import { RainBandNotes } from './rain-band-notes';
import { getRainBandWarnings } from './rain-band-warnings';
import { StrategyBar } from './strategy-bar';
import { StintsForm, type StintRow } from './stints-form';
import { isValidLapCount } from './stint-layout';
import { getSubmitBlockers } from './submit-blockers';
import { useDrivers } from '@/hooks/use-drivers';

interface StrategyBuilderProps {
  raceId: string;
  selectedDriverId: string | null;
  onSelectDriver: (driverId: string) => void;
  /** Called on every edit of the stints, so the page can tell the last result is out of date. */
  onStintsChange: () => void;
  onSimulate: (request: SimulationRequest) => void;
  isSimulating: boolean;
  /** Error of the last simulation attempt, if it failed. */
  simulationError: ApiError | null;
  /** Sends the last strategy again. */
  onRetrySimulation: () => void;
}

const UPSTREAM_ERROR_CODES = ['UPSTREAM_ERROR', 'UPSTREAM_TIMEOUT'];

const INITIAL_ROWS: StintRow[] = [
  { id: 1, compound: 'SOFT', laps: undefined },
  { id: 2, compound: 'HARD', laps: undefined },
];

/** Mount it with `key={raceId}` so the stints start over when the race changes. */
export function StrategyBuilder({
  raceId,
  selectedDriverId,
  onSelectDriver,
  onStintsChange,
  onSimulate,
  isSimulating,
  simulationError,
  onRetrySimulation,
}: StrategyBuilderProps) {
  const { data, error, isFetching, refetch } = useDrivers();
  const { data: raceDetail } = useRaceDetail(raceId);
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [nextRowId, setNextRowId] = useState(INITIAL_ROWS.length + 1);
  const isLoading = isFetching && !data;

  function updateRows(nextRows: StintRow[]) {
    setRows(nextRows);
    onStintsChange();
  }
  const selectedDriver = data?.drivers.find((driver) => driver.id === selectedDriverId);

  const parsed = simulationRequestSchema.safeParse({
    raceId,
    driverId: selectedDriverId ?? '',
    stints: rows.map(({ compound, laps }) => ({ compound, laps })),
  });
  const rowErrors = parsed.success ? {} : toRowErrors(parsed.error.issues, rows);
  const validLaps = rows.map((row) => row.laps).filter(isValidLapCount);
  const assignedLaps = validLaps.reduce((total, laps) => total + laps, 0);
  const hasInvalidStint = validLaps.length < rows.length;
  const blockers = raceDetail
    ? getSubmitBlockers({
        hasDriver: selectedDriverId !== null,
        hasInvalidStint,
        assignedLaps,
        raceLaps: raceDetail.race.laps,
        stintCount: rows.length,
        minimumPitStops: raceDetail.simulationParameters.minimumPitStops,
      })
    : [];
  const rainWarnings = raceDetail
    ? getRainBandWarnings(rows, raceDetail.weather.forecast, raceDetail.tyres, raceDetail.race.laps)
    : [];
  // Rejections of the strategy (400/422) show next to the form; upstream failures can be retried.
  const isUpstreamError =
    simulationError !== null && UPSTREAM_ERROR_CODES.includes(simulationError.code);
  const canSubmit = parsed.success && raceDetail !== undefined && blockers.length === 0;

  return (
    <section aria-labelledby="strategy-builder-title" className="space-y-5">
      <SectionHeading
        step={3}
        id="strategy-builder-title"
        title="Arma tu estrategia"
        description={
          raceDetail &&
          `Elige un piloto y reparte las ${raceDetail.race.laps} vueltas en stints. La barra de stints queda alineada con la del clima.`
        }
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <h3 className="font-semibold">Piloto</h3>
          {isLoading && (
            <>
              <LoadingNotice loading={isLoading} />
              <DriverCardSkeleton />
            </>
          )}
          {error && !isFetching && <ErrorAlert message={error.message} onRetry={() => refetch()} />}
          {data && (
            <>
              <DriverPicker
                drivers={data.drivers}
                selectedDriverId={selectedDriverId}
                onSelectDriver={onSelectDriver}
              />
              {selectedDriver && <DriverCard driver={selectedDriver} />}
            </>
          )}
        </div>

        {raceDetail && (
          <div className="space-y-6 rounded-lg border bg-card p-4">
            <h3 className="font-semibold">Stints</h3>
            <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 self-center">
                Clima
                <InfoHint term="los tramos del clima">{FORECAST_SEGMENTS_HINT}</InfoHint>
              </span>
              <WeatherBar
                forecast={raceDetail.weather.forecast}
                totalLaps={raceDetail.race.laps}
                className="h-10"
              />
              <span className="flex h-10 items-center">Estrategia</span>
              <StrategyBar rows={rows} totalLaps={raceDetail.race.laps} warnings={rainWarnings} />
            </div>
            <RainBandNotes warnings={rainWarnings} />
            <StintsForm
              rows={rows}
              raceLaps={raceDetail.race.laps}
              assignedLaps={assignedLaps}
              hasInvalidStint={hasInvalidStint}
              rowErrors={rowErrors}
              submitError={isUpstreamError ? undefined : simulationError?.message}
              canSubmit={canSubmit}
              blockers={blockers}
              isSubmitting={isSimulating}
              onChangeRow={(id, changes) =>
                updateRows(rows.map((row) => (row.id === id ? { ...row, ...changes } : row)))
              }
              onAddRow={() => {
                updateRows([...rows, { id: nextRowId, compound: 'MEDIUM', laps: undefined }]);
                setNextRowId(nextRowId + 1);
              }}
              onRemoveRow={(id) => updateRows(rows.filter((row) => row.id !== id))}
              onSubmit={() => parsed.success && onSimulate(parsed.data)}
            />
            {isUpstreamError && (
              <ErrorAlert message={simulationError.message} onRetry={onRetrySimulation} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
