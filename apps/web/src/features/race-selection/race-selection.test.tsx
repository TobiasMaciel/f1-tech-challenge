import { onlineManager, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '@/App';
import { server } from '@/test/server';
import { createQueryClient } from '@/lib/query-client';

function renderApp() {
  render(
    <QueryClientProvider client={createQueryClient()}>
      <App />
    </QueryClientProvider>,
  );
}

describe('selección de carrera', () => {
  it('muestra una tarjeta por carrera y marca la elegida', async () => {
    renderApp();

    const bahrain = await screen.findByRole('button', { name: /Bahrain Grand Prix/ });
    const british = screen.getByRole('button', { name: /British Grand Prix/ });
    expect(bahrain).toHaveTextContent('57 vueltas');
    expect(british).toHaveTextContent('Ronda 4');
    expect(british).toHaveTextContent('45%');

    await userEvent.click(british);

    expect(british).toHaveAttribute('aria-pressed', 'true');
    expect(bahrain).toHaveAttribute('aria-pressed', 'false');
  });

  it('muestra el error con un botón para reintentar y se recupera al pulsarlo', async () => {
    server.use(
      http.get(
        '*/api/races',
        () =>
          HttpResponse.json(
            { error: { code: 'UPSTREAM_ERROR', message: 'La API de F1 no está disponible.' } },
            { status: 502 },
          ),
        { once: true },
      ),
    );
    renderApp();

    expect(await screen.findByText('La API de F1 no está disponible.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('button', { name: /Bahrain Grand Prix/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  describe('sin conexión', () => {
    afterEach(() => onlineManager.setOnline(true));

    it('muestra el error con Reintentar en vez de quedarse en blanco', async () => {
      onlineManager.setOnline(false);
      server.use(http.get('*/api/races', () => HttpResponse.error()));
      renderApp();

      expect(await screen.findByText('No se pudo conectar con el servidor.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    });
  });
});
