import type {
  Circuit,
  Driver,
  Race,
  RaceWithCircuit,
  SimulationParameters,
  Team,
  Tyre,
  Weather,
} from './schemas.js';

/** Thrown by the repository when the upstream API answers 404 for a single resource; the race services turn it into RACE_NOT_FOUND. */
export class F1NotFoundError extends Error {
  constructor(readonly path: string) {
    super(`F1 API resource not found: ${path}`);
    this.name = 'F1NotFoundError';
  }
}

/**
 * Read access to the F1 API, one method per upstream resource.
 * Upstream failures surface as `AppError` (502/504); a missing resource as `F1NotFoundError`.
 */
export interface F1Repository {
  getRaces(): Promise<Race[]>;
  getRace(raceId: string): Promise<RaceWithCircuit>;
  getWeather(raceId: string): Promise<Weather>;
  getSimulationParameters(raceId: string): Promise<SimulationParameters>;
  getTyres(): Promise<Tyre[]>;
  getDrivers(): Promise<Driver[]>;
  getTeams(): Promise<Team[]>;
  getCircuits(): Promise<Circuit[]>;
}
