import type { SimulationRequest, SimulationResponse } from '@f1/shared';
import { AppError } from '../errors.js';
import { joinDriverWithTeam } from '../f1/driver-team.js';
import type { F1Repository } from '../f1/f1-repository.js';
import { rethrowAsRaceNotFound } from '../f1/race-not-found.js';
import { simulateRace } from './engine/simulate-race.js';
import { validateStrategy } from './engine/validate-strategy.js';

/** Gathers the race, driver and tyre data, rejects strategies that break the race rules and runs the simulation. */
export async function simulateStrategy(
  f1Repository: F1Repository,
  { raceId, driverId, stints }: SimulationRequest,
): Promise<SimulationResponse> {
  const [race, weather, parameters, tyres, drivers, teams] = await Promise.all([
    f1Repository.getRace(raceId),
    f1Repository.getWeather(raceId),
    f1Repository.getSimulationParameters(raceId),
    f1Repository.getTyres(),
    f1Repository.getDrivers(),
    f1Repository.getTeams(),
  ]).catch(rethrowAsRaceNotFound);

  const driver = drivers.find((candidate) => candidate.id === driverId);
  if (!driver) throw new AppError(404, 'DRIVER_NOT_FOUND', 'El piloto no existe.');

  const problems = validateStrategy(stints, {
    laps: race.laps,
    minimumPitStops: parameters.minimumPitStops,
  });
  const [firstProblem] = problems;
  if (firstProblem !== undefined) {
    throw new AppError(
      422,
      'INVALID_STRATEGY',
      firstProblem,
      problems.map((message) => ({ path: 'stints', message })),
    );
  }

  // The engine has no AppError, so a compound missing upstream is detected here.
  if (stints.some((stint) => !tyres.some((tyre) => tyre.compound === stint.compound))) {
    throw new AppError(
      502,
      'UPSTREAM_ERROR',
      'La API de F1 no devolvió los datos de un neumático de la estrategia.',
    );
  }

  return simulateRace(stints, {
    race: { laps: race.laps },
    circuit: { baseLapTime: race.circuit.baseLapTime, tyreWear: race.circuit.tyreWear },
    parameters,
    tyres,
    driver: joinDriverWithTeam(driver, teams),
    forecast: weather.forecast,
  });
}
