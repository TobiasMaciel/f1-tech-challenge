import { describe, expect, it } from 'vitest';
import { formatDuration, formatRaceTime, formatSignedSeconds, getSecondTicks } from './format';

describe('formatSignedSeconds', () => {
  it('muestra el signo y un decimal por defecto', () => {
    expect(formatSignedSeconds(1.8)).toBe('+1.8 s');
    expect(formatSignedSeconds(-1)).toBe('-1.0 s');
  });

  it('acepta la cantidad de decimales', () => {
    expect(formatSignedSeconds(-32.4, 3)).toBe('-32.400 s');
  });

  it('no muestra signo cuando el valor redondeado es cero', () => {
    expect(formatSignedSeconds(0.04)).toBe('0.0 s');
    expect(formatSignedSeconds(-0.04)).toBe('0.0 s');
  });
});

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

describe('formatRaceTime', () => {
  it('muestra siempre las horas', () => {
    expect(formatRaceTime(5270.058)).toBe('1:27:50.058');
    expect(formatRaceTime(91.5)).toBe('0:01:31.500');
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
