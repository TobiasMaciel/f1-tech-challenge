import type { ForecastSegment, TyreInfo } from '@f1/shared';
import { describe, expect, it } from 'vitest';
import {
  describeRainBandWarning,
  getRainBandWarnings,
  type RainBandWarning,
} from './rain-band-warnings';
import type { StintRow } from './stint-layout';

const soft: TyreInfo = {
  compound: 'SOFT',
  pace: -1,
  degradation: 0.09,
  wetPerformance: 0.1,
  optimalRainIntensity: { min: 0, max: 0.05 },
};
const intermediate: TyreInfo = {
  compound: 'INTERMEDIATE',
  pace: 2.5,
  degradation: 0.05,
  wetPerformance: 0.8,
  optimalRainIntensity: { min: 0.2, max: 0.6 },
};
const wet: TyreInfo = {
  compound: 'WET',
  pace: 3.2,
  degradation: 0.03,
  wetPerformance: 1,
  optimalRainIntensity: { min: 0.6, max: 1 },
};
const tyres = [soft, wet];

const forecast: ForecastSegment[] = [
  { fromLap: 1, toLap: 10, temperature: 30, rainIntensity: 0.45 },
  { fromLap: 11, toLap: 20, temperature: 28, rainIntensity: 0 },
  { fromLap: 21, toLap: 30, temperature: 28, rainIntensity: 0.8 },
];

const row = (id: number, compound: StintRow['compound'], laps: number | undefined): StintRow => ({
  id,
  compound,
  laps,
});

const warning = (overrides: Partial<RainBandWarning>): RainBandWarning => ({
  stint: 1,
  compound: 'WET',
  fromLap: 1,
  toLap: 57,
  rainIntensity: 0,
  tyre: wet,
  side: 'below',
  ...overrides,
});

describe('getRainBandWarnings', () => {
  it('avisa de las vueltas con lluvia fuera de la banda del compuesto y de qué lado quedan', () => {
    const rows = [row(1, 'SOFT', 15), row(2, 'WET', 15)];

    const warnings = getRainBandWarnings(rows, forecast, tyres, 30);

    expect(warnings).toEqual([
      {
        stint: 1,
        compound: 'SOFT',
        fromLap: 1,
        toLap: 10,
        rainIntensity: 0.45,
        tyre: soft,
        side: 'above',
      },
      {
        stint: 2,
        compound: 'WET',
        fromLap: 16,
        toLap: 20,
        rainIntensity: 0,
        tyre: wet,
        side: 'below',
      },
    ]);
  });

  it('no avisa cuando la lluvia cae dentro de la banda', () => {
    const rows = [row(1, 'WET', 10), row(2, 'SOFT', 10), row(3, 'WET', 10)];

    const warnings = getRainBandWarnings(rows, forecast, tyres, 30);

    expect(warnings.map((warning) => warning.stint)).toEqual([1]);
  });

  it('parte el aviso cuando el stint cruza tramos con distinta lluvia', () => {
    const rows = [row(1, 'SOFT', 5), row(2, 'SOFT', 25)];

    const warnings = getRainBandWarnings(rows, forecast, tyres, 30);

    expect(warnings.filter((warning) => warning.stint === 2)).toMatchObject([
      { fromLap: 6, toLap: 10, rainIntensity: 0.45 },
      { fromLap: 21, toLap: 30, rainIntensity: 0.8 },
    ]);
  });

  it('ignora los stints incompletos o inválidos y corta lo que pasa de la carrera', () => {
    const rows = [
      row(1, 'SOFT', undefined),
      row(2, 'SOFT', 0),
      row(3, 'SOFT', 1.5),
      row(4, 'SOFT', 100),
    ];

    const warnings = getRainBandWarnings(rows, forecast, tyres, 30);

    expect(warnings).toMatchObject([
      { stint: 4, fromLap: 1, toLap: 10 },
      { stint: 4, fromLap: 21, toLap: 30 },
    ]);
  });
});

describe('describeRainBandWarning', () => {
  it('con demasiada lluvia para el compuesto dice que queda fuera de su banda', () => {
    const text = describeRainBandWarning(
      warning({
        compound: 'SOFT',
        tyre: soft,
        fromLap: 20,
        toLap: 20,
        rainIntensity: 0.3,
        side: 'above',
      }),
    );

    expect(text).toBe('Stint 1 · Blando: vuelta 20 con lluvia 0.30, fuera de su banda 0.00–0.05');
  });

  it('un neumático de lluvia extrema en seco solo pierde por su ritmo', () => {
    expect(describeRainBandWarning(warning({}))).toBe(
      'Stint 1 · Lluvia extrema: vueltas 1–57 casi sin lluvia (0.00); en seco solo pierde por su ritmo, +3.2 s por vuelta.',
    );
  });

  it('un neumático de lluvia extrema con poca lluvia solo pierde por su ritmo', () => {
    expect(describeRainBandWarning(warning({ rainIntensity: 0.3 }))).toBe(
      'Stint 1 · Lluvia extrema: vueltas 1–57 con lluvia 0.30, por debajo de su banda 0.60–1.00; ahí solo pierde por su ritmo, +3.2 s por vuelta.',
    );
  });

  it('el intermedio por debajo de su banda pierde por su ritmo y por su agarre en mojado', () => {
    const text = describeRainBandWarning(
      warning({ compound: 'INTERMEDIATE', tyre: intermediate, toLap: 19 }),
    );

    expect(text).toBe(
      'Stint 1 · Intermedio: vueltas 1–19 casi sin lluvia (0.00), por debajo de su banda 0.20–0.60; pierde por su ritmo, +2.5 s por vuelta, y por quedar fuera de su banda.',
    );
  });
});
