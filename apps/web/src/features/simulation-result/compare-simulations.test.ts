import type { SimulationResponse } from '@f1/shared';
import { describe, expect, it } from 'vitest';
import { compareSimulations } from './compare-simulations';

function simulation(
  totalTime: number,
  breakdown: { fuel: number; degradation: number },
  pitStopTime: number,
): SimulationResponse {
  return {
    totalTime,
    stints: [],
    pitStops: [{ afterLap: 1, fromCompound: 'SOFT', toCompound: 'HARD', timeLost: pitStopTime }],
    laps: [
      {
        lap: 1,
        stint: 1,
        compound: 'SOFT',
        tyreAge: 0,
        rainIntensity: 0,
        time: 0,
        breakdown: { base: 90, package: 0, tyrePace: 0, weather: 0, ...breakdown },
      },
    ],
  };
}

describe('compareSimulations', () => {
  it('calcula la diferencia del total y de cada término frente a la anterior', () => {
    const previous = simulation(5300, { fuel: 2, degradation: 10 }, 24);
    const current = simulation(5267.6, { fuel: 2, degradation: 4.5 }, 25);

    const comparison = compareSimulations(current, previous);

    expect(comparison.totalDelta).toBeCloseTo(-32.4);
    expect(comparison.terms.degradation).toBeCloseTo(-5.5);
    expect(comparison.terms.pitStops).toBeCloseTo(1);
    expect(comparison.terms.fuel).toBe(0);
  });

  it('devuelve diferencia cero cuando el tiempo total es el mismo', () => {
    const current = simulation(5300.0004, { fuel: 2, degradation: 10 }, 24);
    const previous = simulation(5300, { fuel: 2, degradation: 10 }, 24);

    expect(compareSimulations(current, previous).totalDelta).toBe(0);
  });
});
