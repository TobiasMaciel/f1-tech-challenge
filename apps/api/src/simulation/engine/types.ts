import type {
  Compound,
  DriverWithTeam,
  ForecastSegment,
  RaceDetailSimulationParameters,
  TyreInfo,
} from '@f1/shared';

/** One stint of the strategy: a set of tyres used for a number of laps. */
export interface Stint {
  compound: Compound;
  laps: number;
}

/** Race rules a strategy must respect. */
export interface StrategyRules {
  laps: number;
  minimumPitStops: number;
}

/** Everything the engine needs to simulate a race; the service builds it from the F1 API data. */
export interface SimulationInput {
  race: { laps: number };
  circuit: { baseLapTime: number; tyreWear: number };
  parameters: RaceDetailSimulationParameters;
  tyres: TyreInfo[];
  driver: DriverWithTeam;
  forecast: ForecastSegment[];
}
