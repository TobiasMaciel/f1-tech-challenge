import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CircuitTrack } from './circuit-track';

describe('CircuitTrack', () => {
  it('dibuja el trazado de un circuito conocido', () => {
    const { container } = render(<CircuitTrack circuitId="circuit-02" />);

    expect(container.querySelector('svg path')?.getAttribute('d')).toMatch(/^M[\d.]+ [\d.]+L/);
  });

  it('no dibuja nada si el circuito no tiene trazado', () => {
    const { container } = render(<CircuitTrack circuitId="circuit-99" />);

    expect(container).toBeEmptyDOMElement();
  });
});
