import { describe, expect, it } from 'vitest';
import { describeForecast, getRainLevel } from './rain';

function segment(fromLap: number, toLap: number, rainIntensity: number) {
  return { fromLap, toLap, temperature: 25, rainIntensity };
}

describe('getRainLevel', () => {
  it('llama "Lluvia muy fuerte" al nivel más alto', () => {
    expect(getRainLevel(0.9).label).toBe('Lluvia muy fuerte');
  });
});

describe('describeForecast', () => {
  it('con un solo nivel en toda la carrera lo dice en una frase', () => {
    expect(describeForecast([segment(1, 30, 0), segment(31, 57, 0.02)])).toBe(
      'Seco toda la carrera.',
    );
  });

  it('une los tramos seguidos con el mismo nivel y nombra cada cambio', () => {
    const forecast = [
      segment(1, 10, 0),
      segment(11, 24, 0.03),
      segment(25, 46, 0.4),
      segment(47, 60, 0.6),
      segment(61, 70, 0.7),
    ];

    expect(describeForecast(forecast)).toBe(
      'Seco hasta la vuelta 24, lluvia moderada de la 25 a la 46 y lluvia fuerte de la 47 a la 70.',
    );
  });

  it('con dos niveles los une con "y"', () => {
    expect(describeForecast([segment(1, 20, 0.9), segment(21, 50, 0)])).toBe(
      'Lluvia muy fuerte hasta la vuelta 20 y seco de la 21 a la 50.',
    );
  });
});
