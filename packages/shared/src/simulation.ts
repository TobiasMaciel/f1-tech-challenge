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

export interface StintResult {
  number: number;
  compound: Compound;
  startLap: number;
  endLap: number;
  laps: number;
  /** Seconds, laps only (pit stops are not included). */
  time: number;
  averageLapTime: number;
  /** Seconds lost to tyre wear and to rain over the stint. */
  degradationLoss: number;
  weatherLoss: number;
}

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

export interface LapResult {
  lap: number;
  stint: number;
  compound: Compound;
  /** Laps already completed on this set of tyres. */
  tyreAge: number;
  rainIntensity: number;
  time: number;
  breakdown: LapBreakdown;
}

export interface SimulationResponse {
  /** Seconds, including pit stops. */
  totalTime: number;
  stints: StintResult[];
  pitStops: PitStopResult[];
  laps: LapResult[];
}
