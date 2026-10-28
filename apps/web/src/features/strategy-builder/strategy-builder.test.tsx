import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from '@/App';
import { createQueryClient } from '@/lib/query-client';

describe('elegir piloto', () => {
  it('muestra la ficha con el equipo y las estadísticas del piloto elegido', async () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <App />
      </QueryClientProvider>,
    );
    expect(screen.queryByRole('heading', { name: 'Arma tu estrategia' })).not.toBeInTheDocument();

    await userEvent.click(await screen.findByRole('button', { name: /Bahrain Grand Prix/ }));
    await userEvent.click(await screen.findByRole('combobox', { name: 'Piloto' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Lando Norris' }));

    const card = await screen.findByRole('article', { name: 'Ficha de Lando Norris' });
    expect(card).toHaveTextContent('McLaren');
    expect(card).toHaveTextContent('#4');
    expect(within(card).getByText('Ritmo').nextSibling).toHaveTextContent('0.98');
    expect(within(card).getByText('Rendimiento del auto').nextSibling).toHaveTextContent('0.99');
    expect(within(card).getByText('Consistencia').nextSibling).toHaveTextContent('0.94');
  });
});
