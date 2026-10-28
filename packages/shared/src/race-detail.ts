import type { CircuitType } from './circuit-type.js';
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
  type: CircuitType;
  lengthKm: number;
  /** Seconds. */
  baseLapTime: number;
  /** Multiplier of tyre degradation on this circuit; above 1 wears tyres faster. */
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

/** Race parameters that feed the simulation; times are in seconds. */
export interface RaceDetailSimulationParameters {
  /** Plus or minus, per lap. */
  lapTimeVariance: number;
  /** Time lost driving through the pit lane, without the tyre change. */
  pitStopLoss: number;
  tyreChangeTime: number;
  /** Time gained per lap as the fuel burns off. */
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
  /** From 0 to 1: how much of the rain penalty outside its optimal band the tyre avoids. */
  wetPerformance: number;
  /** Rain intensity range, from 0 to 1, where the tyre has no rain penalty. */
  optimalRainIntensity: { min: number; max: number };
}

/** Everything the strategy screen shows about a race (`GET /api/races/:raceId`). */
export interface RaceDetailResponse {
  race: RaceDetailRace;
  circuit: RaceDetailCircuit;
  weather: { summary: string; forecast: ForecastSegment[] };
  simulationParameters: RaceDetailSimulationParameters;
  tyres: TyreInfo[];
}
