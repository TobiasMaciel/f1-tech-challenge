import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from '@/App';
import { createQueryClient } from '@/lib/query-client';

describe('información de la carrera', () => {
  it('al elegir una carrera muestra el circuito, el resumen del clima y los cinco compuestos', async () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <App />
      </QueryClientProvider>,
    );

    await userEvent.click(await screen.findByRole('button', { name: /Bahrain Grand Prix/ }));

    const circuit = await screen.findByRole('region', { name: 'Circuito' });
    expect(circuit).toHaveTextContent('Bahrain International Circuit');
    expect(circuit).toHaveTextContent('5.410 km');
    expect(circuit).toHaveTextContent('57 vueltas');
    expect(circuit).toHaveTextContent('1:31.500');
    expect(circuit).toHaveTextContent('x1.00');
    expect(circuit).toHaveTextContent('22 s + 2.5 s de cambio');

    const weather = screen.getByRole('region', { name: 'Clima' });
    expect(weather).toHaveTextContent('Very hot and completely dry.');
    expect(within(weather).getAllByRole('listitem')).toHaveLength(2);

    const tyres = screen.getByRole('region', { name: 'Neumáticos' });
    for (const label of ['Blando', 'Medio', 'Duro', 'Intermedio', 'Lluvia extrema']) {
      expect(within(tyres).getByRole('img', { name: label })).toBeInTheDocument();
    }
    expect(tyres).toHaveTextContent('-1.0 s');
    expect(tyres).toHaveTextContent('0.09 s/vuelta');

    const risks = screen.getByText(/Probabilidad de safety car/).parentElement?.parentElement;
    expect(risks).toHaveTextContent('Probabilidad de safety car: 20 %');
    expect(risks).toHaveTextContent('Variabilidad por vuelta: ±0.20 s');
  });

  it('la ayuda de un dato se anuncia como tooltip al enfocarla', async () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <App />
      </QueryClientProvider>,
    );
    await userEvent.click(await screen.findByRole('button', { name: /Bahrain Grand Prix/ }));

    await userEvent.hover(await screen.findByRole('button', { name: 'Ayuda sobre vuelta base' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(/Tiempo de vuelta de referencia/);
  });
});
