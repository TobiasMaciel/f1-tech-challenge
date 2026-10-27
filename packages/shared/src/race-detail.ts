import type { Compound } from './compound.js';

export interface RaceDetailRace {
  id: string;
  name: string;
  round: number;
  date: string;
  laps: number;
  /** Degrees Celsius. */
  temperature: number;
  /** Probability from 0 to 1. */
  rainProbability: number;
}

export interface RaceDetailCircuit {
  id: string;
  name: string;
  country: string;
  type: 'permanent' | 'street' | 'semi-street';
  lengthKm: number;
  /** Seconds. */
  baseLapTime: number;
  tyreWear: number;
  /** From 0 (easy) to 1 (very hard). */
  overtakingDifficulty: number;
}

/** A stretch of laps with constant weather. */
export interface ForecastSegment {
  fromLap: number;
  toLap: number;
  /** Degrees Celsius. */
  temperature: number;
  /** From 0 (dry) to 1 (heavy rain). */
  rainIntensity: number;
}

export interface RaceDetailSimulationParameters {
  /** Seconds, plus or minus, per lap. */
  lapTimeVariance: number;
  /** Seconds. */
  pitStopLoss: number;
  tyreChangeTime: number;
  fuelEffectPerLap: number;
  /** Probability from 0 to 1. */
  safetyCarProbability: number;
  minimumPitStops: number;
}

export interface TyreInfo {
  compound: Compound;
  /** Seconds per lap against the reference compound; negative is faster. */
  pace: number;
  /** Seconds lost per lap of tyre age. */
  degradation: number;
  wetPerformance: number;
  optimalRainIntensity: { min: number; max: number };
}

export interface RaceDetailResponse {
  race: RaceDetailRace;
  circuit: RaceDetailCircuit;
  weather: { summary: string; forecast: ForecastSegment[] };
  simulationParameters: RaceDetailSimulationParameters;
  tyres: TyreInfo[];
}
