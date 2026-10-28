import type { SimulationRequest } from '@f1/shared';
import { useState } from 'react';
import { RaceOverview } from '@/features/race-overview/race-overview';
import { RaceSelection } from '@/features/race-selection/race-selection';
import { SimulationResult } from '@/features/simulation-result/simulation-result';
import { StrategyBuilder } from '@/features/strategy-builder/strategy-builder';
import { useSimulation } from '@/hooks/use-simulation';

/** Short fade and slide-in when a section appears; no movement under reduced motion. */
const SECTION_ENTER =
  'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:ease-out';

export function App() {
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  // True when the driver or the stints changed after the last simulation, so the result no longer matches them.
  const [isResultStale, setIsResultStale] = useState(false);
  const simulation = useSimulation();

  function selectRace(raceId: string) {
    setSelectedRaceId(raceId);
    simulation.reset();
    setIsResultStale(false);
  }

  function selectDriver(driverId: string) {
    setSelectedDriverId(driverId);
    setIsResultStale(true);
  }

  function simulate(request: SimulationRequest) {
    simulation.simulate(request, { onSuccess: () => setIsResultStale(false) });
  }

  return (
    <>
      <header className="border-t-4 border-t-red-600 border-b bg-card/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight">F1 Race Strategist</h1>
          <p className="text-sm text-muted-foreground">
            Simula una carrera con tu estrategia de neumáticos y mira dónde se gana o se pierde el
            tiempo.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-14 px-4 py-8 sm:px-6 sm:py-10">
        <RaceSelection selectedRaceId={selectedRaceId} onSelectRace={selectRace} />
        {selectedRaceId && (
          <div className={SECTION_ENTER}>
            <RaceOverview raceId={selectedRaceId} />
          </div>
        )}
        {selectedRaceId && (
          <div className={SECTION_ENTER}>
            <StrategyBuilder
              key={selectedRaceId}
              raceId={selectedRaceId}
              selectedDriverId={selectedDriverId}
              onSelectDriver={selectDriver}
              onStintsChange={() => setIsResultStale(true)}
              onSimulate={simulate}
              isSimulating={simulation.isPending}
              simulationError={simulation.error}
              onRetrySimulation={() => simulation.variables && simulate(simulation.variables)}
            />
          </div>
        )}
        {selectedRaceId && (
          <div className={SECTION_ENTER}>
            <SimulationResult
              raceId={selectedRaceId}
              result={simulation.data}
              isStale={isResultStale}
            />
          </div>
        )}
      </main>
    </>
  );
}
