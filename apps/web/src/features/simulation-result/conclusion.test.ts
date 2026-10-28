import type { LapResult, SimulationResponse, StintResult } from '@f1/shared';
import { describe, expect, it } from 'vitest';
import { buildConclusion } from './conclusion';

function lap(
  number: number,
  rainIntensity: number,
  breakdown: Partial<LapResult['breakdown']>,
  compound: LapResult['compound'] = 'SOFT',
): LapResult {
  return {
    lap: number,
    stint: 1,
    compound,
    tyreAge: 0,
    rainIntensity,
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

function stint(
  number: number,
  compound: StintResult['compound'],
  weatherLoss: number,
): StintResult {
  return {
    number,
    compound,
    startLap: number,
    endLap: number,
    laps: 1,
    time: 0,
    averageLapTime: 0,
    degradationLoss: 0,
    weatherLoss,
  };
}

function response(overrides: Partial<SimulationResponse>): SimulationResponse {
  return { totalTime: 0, stints: [], pitStops: [], laps: [], ...overrides };
}

describe('buildConclusion', () => {
  it('nombra la decisión de la estrategia con la mayor pérdida', () => {
    const result = response({
      laps: [lap(1, 0, { degradation: 45.2 }), lap(2, 0, { tyrePace: 3 })],
      stints: [stint(1, 'SOFT', 0)],
    });

    expect(buildConclusion(result)).toBe(
      'La decisión de estrategia que más tiempo costó fue el desgaste: +45.2 s.',
    );
  });

  it('no culpa al piloto, al auto ni al combustible, que la estrategia no decide', () => {
    const result = response({
      laps: [lap(1, 0, { package: 100, fuel: 80, degradation: 2 })],
      stints: [stint(1, 'SOFT', 0)],
    });

    expect(buildConclusion(result)).toBe(
      'La decisión de estrategia que más tiempo costó fue el desgaste: +2.0 s.',
    );
  });

  it('dice que no hubo pérdidas cuando ninguna decisión de la estrategia pierde tiempo', () => {
    const result = response({
      laps: [lap(1, 0, { tyrePace: -1, package: 5 })],
      stints: [stint(1, 'SOFT', 0)],
    });

    expect(buildConclusion(result)).toBe(
      'Ninguna decisión de la estrategia perdió tiempo frente a la referencia.',
    );
  });

  it('con lluvia y sin pérdida por clima dice que los neumáticos fueron adecuados', () => {
    const result = response({
      laps: [lap(1, 0.5, { degradation: 4 }, 'INTERMEDIATE')],
      stints: [stint(1, 'INTERMEDIATE', 0), stint(2, 'INTERMEDIATE', 0)],
    });

    expect(buildConclusion(result)).toBe(
      'La decisión de estrategia que más tiempo costó fue el desgaste: +4.0 s. Elegiste neumáticos adecuados para la lluvia en toda la carrera.',
    );
  });

  it('con lluvia nombra el stint que más tiempo perdió por el clima', () => {
    const result = response({
      laps: [lap(1, 0.5, { weather: 9 })],
      stints: [stint(1, 'SOFT', 2), stint(2, 'HARD', 7), stint(3, 'MEDIUM', 0)],
    });

    expect(buildConclusion(result)).toBe(
      'La decisión de estrategia que más tiempo costó fue la lluvia: +9.0 s, sobre todo en el stint 2 (Duro), con un compuesto fuera de su banda.',
    );
  });

  it('con lluvia y otro término como mayor pérdida mantiene las dos oraciones', () => {
    const result = response({
      laps: [lap(1, 0.5, { degradation: 20, weather: 9 })],
      stints: [stint(1, 'SOFT', 2), stint(2, 'HARD', 7)],
    });

    expect(buildConclusion(result)).toBe(
      'La decisión de estrategia que más tiempo costó fue el desgaste: +20.0 s. Los neumáticos perdieron más tiempo con la lluvia en el stint 2 (Duro): +7.0 s.',
    );
  });

  it('no habla de lluvia con una llovizna que la interfaz muestra como seco', () => {
    const result = response({
      laps: [lap(1, 0.03, { degradation: 2 })],
      stints: [stint(1, 'SOFT', 0)],
    });

    expect(buildConclusion(result)).toBe(
      'La decisión de estrategia que más tiempo costó fue el desgaste: +2.0 s.',
    );
  });

  it('avisa cuando se usaron neumáticos de lluvia en seco', () => {
    const result = response({
      laps: [lap(1, 0, { tyrePace: 3.2 }, 'WET')],
      stints: [stint(1, 'WET', 0)],
    });

    expect(buildConclusion(result)).toBe(
      'La decisión de estrategia que más tiempo costó fue el compuesto: +3.2 s. Usaste neumáticos de lluvia en seco: cuestan su ritmo más lento en cada vuelta.',
    );
  });

  it('sin lluvia ni neumáticos de lluvia no habla de neumáticos', () => {
    const result = response({
      laps: [lap(1, 0, { degradation: 2 })],
      stints: [stint(1, 'SOFT', 0)],
    });

    expect(buildConclusion(result)).not.toMatch(/neumáticos/);
  });
});
