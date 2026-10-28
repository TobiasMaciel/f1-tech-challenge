import { z } from 'zod';
import { compoundSchema, type Compound } from './compound.js';
import { raceIdSchema } from './race-id.js';

/** Body of `POST /api/simulations`; the web validates its form with the same schema. */
export const simulationRequestSchema = z.object({
  raceId: raceIdSchema,
  driverId: z.string().min(1, 'Elige un piloto.'),
  stints: z
    .array(
      z.object({
        compound: compoundSchema,
        laps: z
          .number('Indica las vueltas del stint.')
          .int('Debe ser un número entero.')
          .min(1, 'Debe tener al menos 1 vuelta.'),
      }),
    )
    .min(1, 'Agrega al menos un stint.'),
});

export type SimulationRequest = z.infer<typeof simulationRequestSchema>;

/** Totals of one stint; times are in seconds. */
export interface StintResult {
  number: number;
  compound: Compound;
  startLap: number;
  endLap: number;
  laps: number;
  /** Laps only; pit stops are not included. */
  time: number;
  averageLapTime: number;
  /** Lost to tyre wear over the stint. */
  degradationLoss: number;
  /** Lost to rain over the stint. */
  weatherLoss: number;
}

/** A pit stop at the end of a stint. */
export interface PitStopResult {
  afterLap: number;
  fromCompound: Compound;
  toCompound: Compound;
  /** Seconds: pit stop loss plus tyre change time. */
  timeLost: number;
}

/** Contribution in seconds of each term of the lap time model. */
export interface LapBreakdown {
  base: number;
  package: number;
  tyrePace: number;
  degradation: number;
  fuel: number;
  weather: number;
}

/** One simulated lap. */
export interface LapResult {
  lap: number;
  stint: number;
  compound: Compound;
  /** Laps already completed on this set of tyres. */
  tyreAge: number;
  /** From 0 (dry) to 1 (heavy rain). */
  rainIntensity: number;
  /** Seconds. */
  time: number;
  breakdown: LapBreakdown;
}

/** Body of a successful `POST /api/simulations`. */
export interface SimulationResponse {
  /** Seconds, including pit stops. */
  totalTime: number;
  stints: StintResult[];
  pitStops: PitStopResult[];
  laps: LapResult[];
}
