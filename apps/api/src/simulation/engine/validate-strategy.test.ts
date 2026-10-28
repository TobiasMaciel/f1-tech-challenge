import { describe, expect, it } from 'vitest';
import { validateStrategy } from './validate-strategy.js';

const rules = { laps: 57, minimumPitStops: 1 };

describe('validateStrategy', () => {
  it('no devuelve problemas con una estrategia válida', () => {
    const problems = validateStrategy(
      [
        { compound: 'SOFT', laps: 20 },
        { compound: 'HARD', laps: 37 },
      ],
      rules,
    );

    expect(problems).toEqual([]);
  });

  it('indica la suma de vueltas y las de la carrera cuando no coinciden', () => {
    const problems = validateStrategy(
      [
        { compound: 'SOFT', laps: 20 },
        { compound: 'HARD', laps: 30 },
      ],
      rules,
    );

    expect(problems).toEqual(['Los stints suman 50 vueltas y la carrera tiene 57.']);
  });

  it('rechaza una estrategia con menos paradas que el mínimo', () => {
    const problems = validateStrategy([{ compound: 'HARD', laps: 57 }], rules);

    expect(problems).toEqual(['La carrera exige al menos 1 parada y la estrategia tiene 0.']);
  });

  it('devuelve todos los problemas juntos', () => {
    const problems = validateStrategy([{ compound: 'HARD', laps: 10 }], rules);

    expect(problems).toHaveLength(2);
  });
});
