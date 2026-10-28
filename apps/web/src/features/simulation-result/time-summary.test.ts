import type { LapResult, SimulationResponse } from '@f1/shared';
import { describe, expect, it } from 'vitest';
import { summarizeTime } from './time-summary';

function lap(number: number, breakdown: Partial<LapResult['breakdown']>): LapResult {
  return {
    lap: number,
    stint: 1,
    compound: 'SOFT',
    tyreAge: number - 1,
    rainIntensity: 0,
    time: 0,
    breakdown: {
      base: 90,
      package: 0,
      tyrePace: 0,
      degradation: 0,
      fuel: 0,
      weather: 0,
      ...breakdown,
    },
  };
}

describe('summarizeTime', () => {
  it('suma cada término de las vueltas, las paradas y la referencia', () => {
    const response: SimulationResponse = {
      totalTime: 0,
      stints: [],
      pitStops: [
        { afterLap: 1, fromCompound: 'SOFT', toCompound: 'HARD', timeLost: 24 },
        { afterLap: 2, fromCompound: 'HARD', toCompound: 'SOFT', timeLost: 25 },
      ],
      laps: [
        lap(1, { package: -0.5, tyrePace: -0.4, degradation: 0.1, fuel: 1.5, weather: 0 }),
        lap(2, { package: -0.5, tyrePace: -0.4, degradation: 0.3, fuel: 1.4, weather: 2 }),
      ],
    };

    const { reference, terms } = summarizeTime(response);

    expect(reference).toBe(180);
    const seconds = Object.fromEntries(terms.map((term) => [term.label, term.seconds]));
    expect(seconds['Piloto y auto']).toBeCloseTo(-1);
    expect(seconds['Compuesto']).toBeCloseTo(-0.8);
    expect(seconds['Desgaste']).toBeCloseTo(0.4);
    expect(seconds['Combustible']).toBeCloseTo(2.9);
    expect(seconds['Lluvia']).toBe(2);
    expect(seconds['Paradas']).toBe(49);
  });
});
