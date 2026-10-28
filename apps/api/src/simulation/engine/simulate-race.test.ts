import { describe, expect, it } from 'vitest';
import { bahrain } from './fixtures.js';
import { simulateRace } from './simulate-race.js';
import type { SimulationInput, Stint } from './types.js';

const softThenHard: Stint[] = [
  { compound: 'SOFT', laps: 20 },
  { compound: 'HARD', laps: 37 },
];

describe('simulateRace', () => {
  it('suma todos los términos del modelo y la parada en el tiempo total', () => {
    const result = simulateRace(softThenHard, bahrain);

    // 5270.058 (base, ritmo, degradación, parada) + 57 x 1.3725 (piloto/auto) - 0.037 x (0 + ... + 56) (combustible)
    expect(result.totalTime).toBeCloseTo(5289.24, 2);
  });

  it('describe cada stint con sus vueltas, tiempo y pérdidas por degradación y lluvia', () => {
    const { stints } = simulateRace(softThenHard, bahrain);

    expect(stints).toEqual([
      {
        number: 1,
        compound: 'SOFT',
        startLap: 1,
        endLap: 20,
        laps: 20,
        time: 1853.505,
        averageLapTime: 92.675,
        degradationLoss: 23.085,
        weatherLoss: 0,
      },
      {
        number: 2,
        compound: 'HARD',
        startLap: 21,
        endLap: 57,
        laps: 37,
        time: 3411.234,
        averageLapTime: 92.196,
        degradationLoss: 26.973,
        weatherLoss: 0,
      },
    ]);
  });

  it('suma la pérdida por lluvia de cada stint usando el clima de cada vuelta', () => {
    const rainyBahrain: SimulationInput = {
      ...bahrain,
      forecast: [
        { fromLap: 1, toLap: 1, temperature: 30, rainIntensity: 0.35 },
        { fromLap: 2, toLap: 2, temperature: 30, rainIntensity: 0.05 },
      ],
    };

    const { stints, laps } = simulateRace([{ compound: 'SOFT', laps: 2 }], rainyBahrain);

    // lap 1: 91.5 x (1 - 0.1) x (0.35 - 0.05); lap 2 is inside the optimal band
    expect(laps[0]?.rainIntensity).toBe(0.35);
    expect(stints[0]?.weatherLoss).toBeCloseTo(24.705, 3);
  });

  it('registra una parada al final de cada stint salvo el último', () => {
    const { pitStops } = simulateRace(softThenHard, bahrain);

    expect(pitStops).toEqual([
      { afterLap: 20, fromCompound: 'SOFT', toCompound: 'HARD', timeLost: 24.5 },
    ]);
  });

  it('detalla todas las vueltas con la edad del neumático y el desglose del tiempo', () => {
    const { laps } = simulateRace(softThenHard, bahrain);

    expect(laps).toHaveLength(57);
    expect(laps[0]).toEqual({
      lap: 1,
      stint: 1,
      compound: 'SOFT',
      tyreAge: 0,
      rainIntensity: 0,
      time: 91.873,
      breakdown: { base: 91.5, package: 1.373, tyrePace: -1, degradation: 0, fuel: 0, weather: 0 },
    });
    expect(laps[20]).toMatchObject({ lap: 21, stint: 2, compound: 'HARD', tyreAge: 0 });
    expect(laps[56]).toMatchObject({ lap: 57, tyreAge: 36, time: 92.259 });
  });
});
