import { describe, expect, it } from 'vitest';
import { formatDuration, getSecondTicks } from './format';

describe('formatDuration', () => {
  it('muestra minutos, segundos y milésimas por debajo de una hora', () => {
    expect(formatDuration(91.5)).toBe('1:31.500');
  });

  it('agrega las horas desde una hora en adelante', () => {
    expect(formatDuration(3725.25)).toBe('1:02:05.250');
  });

  it('redondea las milésimas sin dejar 60 segundos', () => {
    expect(formatDuration(119.9996)).toBe('2:00.000');
  });
});

describe('getSecondTicks', () => {
  it('reparte marcas en segundos redondos que cubren el rango', () => {
    expect(getSecondTicks(91.2, 97.8)).toEqual([90, 92, 94, 96, 98]);
  });

  it('usa pasos más grandes cuando el rango es amplio', () => {
    expect(getSecondTicks(88, 131)).toEqual([80, 90, 100, 110, 120, 130, 140]);
  });
});
