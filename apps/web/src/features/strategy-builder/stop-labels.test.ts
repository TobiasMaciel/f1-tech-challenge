import { describe, expect, it } from 'vitest';
import { placeStopLabels } from './stop-labels';

describe('placeStopLabels', () => {
  it('deja en la primera línea las paradas separadas', () => {
    expect(placeStopLabels([20, 60])).toEqual([0, 0]);
  });

  it('baja a la segunda línea una parada cercana a la anterior', () => {
    expect(placeStopLabels([20, 25])).toEqual([0, 1]);
  });

  it('oculta la etiqueta cuando no hay lugar en ninguna línea', () => {
    expect(placeStopLabels([2, 4, 6, 8, 30])).toEqual([0, 1, null, null, 0]);
  });
});
