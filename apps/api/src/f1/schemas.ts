import { circuitTypeSchema, compoundSchema } from '@f1/shared';
import { z } from 'zod';

// Upstream payloads, as the F1 API returns them (already unwrapped from `data`).

export const circuitSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  type: circuitTypeSchema,
  laps: z.number(),
  lengthKm: z.number(),
  baseLapTime: z.number(),
  pitStopLoss: z.number(),
  tyreWear: z.number(),
  overtakingDifficulty: z.number(),
});

export const raceSchema = z.object({
  id: z.string(),
  name: z.string(),
  round: z.number(),
  date: z.string(),
  circuitId: z.string(),
  laps: z.number(),
  temperature: z.number(),
  rainProbability: z.number(),
});

export const raceWithCircuitSchema = raceSchema.extend({ circuit: circuitSchema });

export const weatherSchema = z.object({
  raceId: z.string(),
  summary: z.string(),
  forecast: z
    .array(
      z.object({
        fromLap: z.number(),
        toLap: z.number(),
        temperature: z.number(),
        rainIntensity: z.number(),
      }),
    )
    .min(1),
});

export const simulationParametersSchema = z.object({
  raceId: z.string(),
  lapTimeVariance: z.number(),
  pitStopLoss: z.number(),
  tyreChangeTime: z.number(),
  fuelEffectPerLap: z.number(),
  safetyCarProbability: z.number(),
  minimumPitStops: z.number(),
});

export const tyreSchema = z.object({
  compound: compoundSchema,
  pace: z.number(),
  degradation: z.number(),
  wetPerformance: z.number(),
  optimalRainIntensity: z.object({ min: z.number(), max: z.number() }),
});

export const driverSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.number(),
  teamId: z.string(),
  pace: z.number(),
  consistency: z.number(),
});

export const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  carPerformance: z.number(),
});

// An empty list is treated as an invalid payload: every collection has data upstream.
export const racesPayloadSchema = z.object({ races: z.array(raceSchema).min(1) });
export const tyresPayloadSchema = z.object({ tyres: z.array(tyreSchema).min(1) });
export const driversPayloadSchema = z.object({ drivers: z.array(driverSchema).min(1) });
export const teamsPayloadSchema = z.object({ teams: z.array(teamSchema).min(1) });
export const circuitsPayloadSchema = z.object({ circuits: z.array(circuitSchema).min(1) });

export type Circuit = z.infer<typeof circuitSchema>;
export type Race = z.infer<typeof raceSchema>;
export type RaceWithCircuit = z.infer<typeof raceWithCircuitSchema>;
export type Weather = z.infer<typeof weatherSchema>;
export type SimulationParameters = z.infer<typeof simulationParametersSchema>;
export type Tyre = z.infer<typeof tyreSchema>;
export type Driver = z.infer<typeof driverSchema>;
export type Team = z.infer<typeof teamSchema>;
