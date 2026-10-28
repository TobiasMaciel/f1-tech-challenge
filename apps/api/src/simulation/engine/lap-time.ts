import type { LapBreakdown, TyreInfo } from '@f1/shared';
import type { SimulationInput } from './types.js';

/** What a lap-time term may depend on. */
export interface LapContext {
  input: SimulationInput;
  tyre: TyreInfo;
  /** Race lap, starting at 1. */
  lap: number;
  /** Laps already completed on this set of tyres. */
  tyreAge: number;
  rainIntensity: number;
}

// One function per term of the lap time model; each returns its contribution in seconds.

function baseTerm({ input }: LapContext): number {
  return input.circuit.baseLapTime;
}

function packageTerm({ input }: LapContext): number {
  const { driver } = input;
  return input.circuit.baseLapTime * (1 - (driver.pace + driver.team.carPerformance) / 2);
}

function tyrePaceTerm({ tyre }: LapContext): number {
  return tyre.pace;
}

function degradationTerm({ input, tyre, tyreAge }: LapContext): number {
  return tyre.degradation * tyreAge * input.circuit.tyreWear;
}

/** Negative: the car gets faster as the fuel burns off. */
function fuelTerm({ input, lap }: LapContext): number {
  return (1 - lap) * input.parameters.fuelEffectPerLap;
}

/** Penalty proportional to how far the rain is from the tyre's optimal band; 0 inside it. */
function weatherTerm({ input, tyre, rainIntensity }: LapContext): number {
  const { min, max } = tyre.optimalRainIntensity;
  const distanceToBand = Math.max(min - rainIntensity, rainIntensity - max, 0);
  return input.circuit.baseLapTime * (1 - tyre.wetPerformance) * distanceToBand;
}

/** Splits a lap time into the contribution of each term of the model; the lap time is their sum. */
export function computeLapBreakdown(context: LapContext): LapBreakdown {
  return {
    base: baseTerm(context),
    package: packageTerm(context),
    tyrePace: tyrePaceTerm(context),
    degradation: degradationTerm(context),
    fuel: fuelTerm(context),
    weather: weatherTerm(context),
  };
}
