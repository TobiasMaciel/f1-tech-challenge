import type { TyreInfo } from '@f1/shared';
import type { SimulationInput } from './types.js';

export const soft: TyreInfo = {
  compound: 'SOFT',
  pace: -1,
  degradation: 0.09,
  wetPerformance: 0.1,
  optimalRainIntensity: { min: 0, max: 0.05 },
};
export const hard: TyreInfo = {
  compound: 'HARD',
  pace: 0,
  degradation: 0.03,
  wetPerformance: 0.2,
  optimalRainIntensity: { min: 0, max: 0.1 },
};
export const intermediate: TyreInfo = {
  compound: 'INTERMEDIATE',
  pace: 1.8,
  degradation: 0.07,
  wetPerformance: 0.8,
  optimalRainIntensity: { min: 0.15, max: 0.6 },
};
export const wet: TyreInfo = {
  compound: 'WET',
  pace: 3.2,
  degradation: 0.05,
  wetPerformance: 1,
  optimalRainIntensity: { min: 0.55, max: 1 },
};

/** Bahrain with Lando Norris, a dry forecast and SOFT and HARD tyres available. */
export const bahrain: SimulationInput = {
  race: { laps: 57 },
  circuit: { baseLapTime: 91.5, tyreWear: 1.35 },
  parameters: {
    lapTimeVariance: 0.15,
    pitStopLoss: 22,
    tyreChangeTime: 2.5,
    fuelEffectPerLap: 0.037,
    safetyCarProbability: 0.2,
    minimumPitStops: 1,
  },
  tyres: [soft, hard],
  driver: {
    id: 'driver-01',
    name: 'Lando Norris',
    number: 4,
    pace: 0.98,
    consistency: 0.94,
    team: { id: 'team-01', name: 'McLaren', carPerformance: 0.99 },
  },
  forecast: [{ fromLap: 1, toLap: 57, temperature: 32, rainIntensity: 0 }],
};
