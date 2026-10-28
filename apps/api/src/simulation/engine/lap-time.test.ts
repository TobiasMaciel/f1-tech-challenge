import type { TyreInfo } from '@f1/shared';
import { describe, expect, it } from 'vitest';
import { bahrain as bahrainInput, intermediate, soft, wet } from './fixtures.js';
import { computeLapBreakdown, type LapContext } from './lap-time.js';

function contextFor(baseLapTime: number, overrides: Partial<LapContext>): LapContext {
  const input = { ...bahrainInput, circuit: { ...bahrainInput.circuit, baseLapTime } };
  return { input, tyre: soft, lap: 1, tyreAge: 0, rainIntensity: 0, ...overrides };
}

const bahrain = (overrides: Partial<LapContext> = {}) => contextFor(91.5, overrides);
const singapore = (overrides: Partial<LapContext> = {}) => contextFor(93.5, overrides);

const lapTime = (context: LapContext) =>
  Object.values(computeLapBreakdown(context)).reduce((total, term) => total + term, 0);

describe('computeLapBreakdown', () => {
  it('el ajuste de piloto y auto resta una fracción de la vuelta base', () => {
    const { package: packageTerm } = computeLapBreakdown(bahrain());

    // 91.5 x (1 - (0.98 + 0.99) / 2)
    expect(packageTerm).toBeCloseTo(1.3725, 4);
  });

  it('el combustible hace al auto más rápido a medida que avanza la carrera', () => {
    const { fuel } = computeLapBreakdown(bahrain({ lap: 10 }));

    // -0.037 x 9
    expect(fuel).toBeCloseTo(-0.333, 4);
  });

  it('la lluvia por encima de la banda óptima penaliza según el agarre en mojado', () => {
    const { weather } = computeLapBreakdown(singapore({ tyre: intermediate, rainIntensity: 0.85 }));

    // 93.5 x (1 - 0.8) x (0.85 - 0.6)
    expect(weather).toBeCloseTo(4.675, 4);
  });

  it('por debajo de la banda óptima penaliza según el agarre en mojado que le falta', () => {
    const { weather } = computeLapBreakdown(singapore({ tyre: intermediate, rainIntensity: 0 }));

    // 93.5 x (1 - 0.8) x (0.15 - 0)
    expect(weather).toBeCloseTo(2.805, 4);
  });

  it('la lluvia dentro de la banda óptima no penaliza', () => {
    const { weather } = computeLapBreakdown(singapore({ tyre: intermediate, rainIntensity: 0.45 }));

    expect(weather).toBe(0);
  });

  it('suma todos los términos en la vuelta 10 de Norris con SOFT en seco', () => {
    // The worked example adds terms already rounded to 3 decimals (92.634); the exact sum is 92.633.
    expect(lapTime(bahrain({ lap: 10, tyreAge: 9 }))).toBeCloseTo(92.634, 2);
  });

  it('en Singapur con lluvia 0.85 el WET es más rápido que el INTERMEDIATE y mucho más que el SOFT', () => {
    const lapWith = (tyre: TyreInfo) => lapTime(singapore({ tyre, rainIntensity: 0.85 }));

    expect(lapWith(wet)).toBeLessThan(lapWith(intermediate));
    expect(lapWith(intermediate)).toBeLessThan(lapWith(soft) - 50);
  });

  it('en Singapur con lluvia 0.45 el INTERMEDIATE es más rápido que el WET', () => {
    const lapWith = (tyre: TyreInfo) => lapTime(singapore({ tyre, rainIntensity: 0.45 }));

    expect(lapWith(intermediate)).toBeLessThan(lapWith(wet));
  });
});
