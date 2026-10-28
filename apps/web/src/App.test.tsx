import type { SimulationResponse } from '@f1/shared';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/render-app';
import { server } from '@/test/server';

const simulationResponse: SimulationResponse = {
  totalTime: 5270.058,
  stints: [
    {
      number: 1,
      compound: 'SOFT',
      startLap: 1,
      endLap: 20,
      laps: 20,
      time: 1833.085,
      averageLapTime: 91.654,
      degradationLoss: 23.085,
      weatherLoss: 0,
    },
    {
      number: 2,
      compound: 'HARD',
      startLap: 21,
      endLap: 57,
      laps: 37,
      time: 3412.473,
      averageLapTime: 92.229,
      degradationLoss: 26.973,
      weatherLoss: 3.2,
    },
  ],
  pitStops: [{ afterLap: 20, fromCompound: 'SOFT', toCompound: 'HARD', timeLost: 24.5 }],
  laps: [
    {
      lap: 1,
      stint: 1,
      compound: 'SOFT',
      tyreAge: 0,
      rainIntensity: 0,
      time: 91.5,
      breakdown: { base: 90, package: -0.5, tyrePace: -0.4, degradation: 0.4, fuel: 2, weather: 0 },
    },
    {
      lap: 2,
      stint: 2,
      compound: 'HARD',
      tyreAge: 0,
      rainIntensity: 0.6,
      time: 95,
      breakdown: {
        base: 90,
        package: -0.5,
        tyrePace: 0.4,
        degradation: 0,
        fuel: 1.9,
        weather: 3.2,
      },
    },
  ],
};

/** Opens the app with race-01 and Lando Norris chosen, and the two default stints (SOFT, HARD) on screen. */
async function openStrategyBuilder() {
  renderApp();
  await userEvent.click(await screen.findByRole('button', { name: /Bahrain Grand Prix/ }));
  await userEvent.click(await screen.findByRole('combobox', { name: 'Piloto' }));
  await userEvent.click(await screen.findByRole('option', { name: 'Lando Norris' }));
}

async function fillLaps(first: string, second: string) {
  await userEvent.type(await screen.findByLabelText('Vueltas del stint 1'), first);
  await userEvent.type(screen.getByLabelText('Vueltas del stint 2'), second);
}

describe('simular una estrategia', () => {
  it('arma dos stints, simula y muestra el tiempo total y la tabla de stints', async () => {
    server.use(http.post('*/api/simulations', () => HttpResponse.json(simulationResponse)));
    await openStrategyBuilder();

    await fillLaps('20', '37');
    expect(screen.getByText('57 / 57 vueltas')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Simular' }));

    expect(await screen.findAllByText('1:27:50.058')).not.toHaveLength(0);
    const table = screen.getByRole('table', { name: 'Stints de la estrategia' });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(rows[1]).toHaveTextContent('1–20');
    expect(rows[1]).toHaveTextContent('30:33.085');
    expect(rows[2]).toHaveTextContent('21–57');
    expect(within(table).getByText('Pérdida por lluvia')).toBeInTheDocument();
    expect(rows[2]).toHaveTextContent('+27.0 s');
    expect(rows[2]).toHaveTextContent('+3.2 s');
  });

  it('muestra dónde se fue el tiempo, la parada y el gráfico tras simular', async () => {
    server.use(http.post('*/api/simulations', () => HttpResponse.json(simulationResponse)));
    await openStrategyBuilder();

    await fillLaps('20', '37');
    await userEvent.click(screen.getByRole('button', { name: 'Simular' }));

    const summary = await screen.findByRole('region', { name: 'Dónde se fue el tiempo' });
    expect(within(summary).getByText(/Referencia: 2 vueltas/)).toBeInTheDocument();
    expect(within(summary).getByText('Piloto y auto').parentElement).toHaveTextContent('-1.0 s');
    expect(within(summary).getByText('Lluvia').parentElement).toHaveTextContent('+3.2 s');
    expect(within(summary).getByText('Paradas').parentElement).toHaveTextContent('+24.5 s');
    const pitStops = screen.getByRole('region', { name: 'Paradas' });
    expect(pitStops).toHaveTextContent('Tras la vuelta 20');
    expect(within(pitStops).getByRole('img', { name: 'Blando' })).toBeInTheDocument();
    expect(within(pitStops).getByRole('img', { name: 'Duro' })).toBeInTheDocument();
    expect(pitStops).toHaveTextContent('24.5 s perdidos');
    expect(await screen.findByRole('heading', { name: 'Tiempo por vuelta' })).toBeInTheDocument();
  });

  it('muestra la conclusión del resultado tras simular', async () => {
    server.use(http.post('*/api/simulations', () => HttpResponse.json(simulationResponse)));
    await openStrategyBuilder();

    await fillLaps('20', '37');
    await userEvent.click(screen.getByRole('button', { name: 'Simular' }));

    expect(
      await screen.findByText(
        'La mayor pérdida vino de las paradas: +24.5 s. Los neumáticos perdieron más tiempo con la lluvia en el stint 2 (Duro): +3.2 s.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Resultado de la simulación' })).toHaveFocus();
  });

  it('avisa antes de simular cuando un compuesto queda fuera de su banda de lluvia', async () => {
    await openStrategyBuilder();

    await fillLaps('20', '37');

    const warnings = await screen.findByRole('list', { name: 'Avisos de lluvia' });
    expect(
      within(warnings)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual([
      'Stint 1 · Blando: vuelta 20 con lluvia 0.30, fuera de su banda 0.00–0.05',
      'Stint 2 · Duro: vueltas 21–57 con lluvia 0.30, fuera de su banda 0.00–0.10',
    ]);
  });

  it('dibuja la barra de stints con la vuelta de la parada mientras se arma la estrategia', async () => {
    await openStrategyBuilder();

    await fillLaps('20', '30');

    expect(await screen.findByTitle('Parada tras la vuelta 20')).toHaveTextContent('V20');
    expect(screen.getByTitle('Blando: 20 vueltas')).toBeInTheDocument();
    expect(screen.getByTitle('Duro: 30 vueltas')).toBeInTheDocument();
  });

  it('mantiene Simular deshabilitado mientras las vueltas no suman las de la carrera', async () => {
    await openStrategyBuilder();

    await fillLaps('20', '30');

    expect(screen.getByText('50 / 57 vueltas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Simular' })).toBeDisabled();
  });

  it('explica cuántas vueltas faltan o sobran para poder simular', async () => {
    await openStrategyBuilder();

    await fillLaps('20', '30');
    expect(screen.getByText('Faltan 7 vueltas')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Vueltas del stint 2'), '0');
    expect(screen.getByText('Sobran 263 vueltas')).toBeInTheDocument();
  });

  it('explica que hace falta elegir un piloto', async () => {
    renderApp();
    await userEvent.click(await screen.findByRole('button', { name: /Bahrain Grand Prix/ }));

    await fillLaps('20', '37');

    expect(await screen.findByText('Falta elegir un piloto')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Simular' })).toBeDisabled();
  });

  it('explica cuántas paradas exige la carrera cuando la estrategia no llega', async () => {
    await openStrategyBuilder();

    await userEvent.click(await screen.findByRole('button', { name: 'Quitar stint 2' }));
    await userEvent.type(screen.getByLabelText('Vueltas del stint 1'), '57');

    expect(screen.getByText('Se necesita al menos 1 parada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Simular' })).toBeDisabled();
  });

  it('muestra junto al formulario el mensaje de un 422 de la API', async () => {
    server.use(
      http.post('*/api/simulations', () =>
        HttpResponse.json(
          {
            error: {
              code: 'INVALID_STRATEGY',
              message: 'La carrera exige al menos 2 paradas y la estrategia tiene 1.',
            },
          },
          { status: 422 },
        ),
      ),
    );
    await openStrategyBuilder();

    await fillLaps('20', '37');
    await userEvent.click(screen.getByRole('button', { name: 'Simular' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La carrera exige al menos 2 paradas y la estrategia tiene 1.',
    );
    expect(screen.queryAllByText('1:27:50.058')).toHaveLength(0);
  });

  it('quita el error de la simulación al cambiar la estrategia', async () => {
    server.use(
      http.post('*/api/simulations', () =>
        HttpResponse.json(
          { error: { code: 'INVALID_STRATEGY', message: 'Estrategia inválida.' } },
          { status: 422 },
        ),
      ),
    );
    await openStrategyBuilder();
    await fillLaps('20', '37');
    await userEvent.click(screen.getByRole('button', { name: 'Simular' }));
    await screen.findByText('Estrategia inválida.');

    await userEvent.type(screen.getByLabelText('Vueltas del stint 2'), '0');

    expect(screen.queryByText('Estrategia inválida.')).not.toBeInTheDocument();
  });

  it('no ofrece reintentar cuando la API rechaza la estrategia', async () => {
    server.use(
      http.post('*/api/simulations', () =>
        HttpResponse.json(
          { error: { code: 'INVALID_STRATEGY', message: 'Estrategia inválida.' } },
          { status: 422 },
        ),
      ),
    );
    await openStrategyBuilder();

    await fillLaps('20', '37');
    await userEvent.click(screen.getByRole('button', { name: 'Simular' }));

    await screen.findByText('Estrategia inválida.');
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('ofrece reintentar la misma estrategia cuando falla la API de F1', async () => {
    let attempts = 0;
    server.use(
      http.post('*/api/simulations', () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json(
              { error: { code: 'UPSTREAM_ERROR', message: 'No se pudo obtener los datos.' } },
              { status: 502 },
            )
          : HttpResponse.json(simulationResponse);
      }),
    );
    await openStrategyBuilder();

    await fillLaps('20', '37');
    await userEvent.click(screen.getByRole('button', { name: 'Simular' }));
    expect(await screen.findByText('No se pudo obtener los datos.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findAllByText('1:27:50.058')).not.toHaveLength(0);
    expect(screen.queryByText('No se pudo obtener los datos.')).not.toBeInTheDocument();
  });
});

describe('vueltas de cada stint', () => {
  it('acepta solo dígitos en las vueltas', async () => {
    await openStrategyBuilder();

    await userEvent.type(await screen.findByLabelText('Vueltas del stint 1'), '1e3');

    expect(screen.getByLabelText('Vueltas del stint 1')).toHaveValue('13');
  });

  it('no da el contador por completo mientras un stint no tiene vueltas válidas', async () => {
    await openStrategyBuilder();

    await fillLaps('20', '37');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar stint' }));

    expect(screen.getByText('57 / 57 vueltas')).not.toHaveClass('text-emerald-400');
    expect(screen.getByText('Completa las vueltas de cada stint')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Simular' })).toBeDisabled();
  });
});

describe('resultado de la simulación', () => {
  it('un doble clic en Simular envía una sola simulación', async () => {
    let requests = 0;
    server.use(
      http.post('*/api/simulations', () => {
        requests += 1;
        return HttpResponse.json(simulationResponse);
      }),
    );
    await openStrategyBuilder();
    await fillLaps('20', '37');

    const button = screen.getByRole('button', { name: 'Simular' });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(await screen.findAllByText('1:27:50.058')).not.toHaveLength(0);
    expect(requests).toBe(1);
  });

  it('atenúa el resultado al cambiar la estrategia hasta volver a simular', async () => {
    server.use(http.post('*/api/simulations', () => HttpResponse.json(simulationResponse)));
    await openStrategyBuilder();
    await fillLaps('20', '37');
    await userEvent.click(screen.getByRole('button', { name: 'Simular' }));
    await screen.findAllByText('1:27:50.058');
    const notice = 'Cambiaste la estrategia: simula de nuevo para actualizar el resultado.';
    expect(screen.queryByText(notice)).not.toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Vueltas del stint 2'));
    await userEvent.type(screen.getByLabelText('Vueltas del stint 2'), '37');

    expect(screen.getByText(notice)).toBeInTheDocument();
    expect(screen.getAllByText('1:27:50.058')).not.toHaveLength(0);

    await userEvent.click(screen.getByRole('button', { name: 'Simular' }));
    await waitFor(() => expect(screen.queryByText(notice)).not.toBeInTheDocument());
  });

  it('mantiene el último resultado mientras vuelve a simular y si la nueva simulación falla', async () => {
    let releaseSecondRequest = () => {};
    let requests = 0;
    server.use(
      http.post('*/api/simulations', async () => {
        requests += 1;
        if (requests === 1) return HttpResponse.json(simulationResponse);
        await new Promise<void>((resolve) => (releaseSecondRequest = resolve));
        return HttpResponse.json(
          { error: { code: 'UPSTREAM_ERROR', message: 'No se pudo obtener los datos.' } },
          { status: 502 },
        );
      }),
    );
    await openStrategyBuilder();
    await fillLaps('20', '37');
    await userEvent.click(screen.getByRole('button', { name: 'Simular' }));
    await screen.findAllByText('1:27:50.058');

    await userEvent.click(screen.getByRole('button', { name: 'Simular' }));

    expect(await screen.findByRole('button', { name: 'Simulando…' })).toBeInTheDocument();
    expect(screen.getAllByText('1:27:50.058')).not.toHaveLength(0);
    releaseSecondRequest();
    expect(await screen.findByText('No se pudo obtener los datos.')).toBeInTheDocument();
    expect(screen.getAllByText('1:27:50.058')).not.toHaveLength(0);
  });

  it('muestra la diferencia con la simulación anterior de la misma carrera y la quita al cambiar de carrera', async () => {
    const totalTimes = [5270.058, 5237.658];
    server.use(
      http.post('*/api/simulations', () =>
        HttpResponse.json({ ...simulationResponse, totalTime: totalTimes.shift() }),
      ),
    );
    await openStrategyBuilder();
    await fillLaps('20', '37');
    await userEvent.click(screen.getByRole('button', { name: 'Simular' }));
    await screen.findAllByText('1:27:50.058');
    expect(screen.queryByText(/frente a la anterior/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Simular' }));

    expect(await screen.findByText('-32.400 s frente a la anterior')).toBeInTheDocument();
    expect(screen.getByText('Anterior:').parentElement).toHaveTextContent('S20H37');
    const summary = screen.getByRole('region', { name: 'Dónde se fue el tiempo' });
    expect(within(summary).getByText('Paradas').parentElement).toHaveTextContent('0.0 s');

    await userEvent.click(screen.getByRole('button', { name: /British Grand Prix/ }));

    await waitFor(() => expect(screen.queryByText(/frente a la anterior/)).not.toBeInTheDocument());
  });

  it('no pide completar los stints si la carrera no se pudo cargar', async () => {
    server.use(
      http.get('*/api/races/race-01', () =>
        HttpResponse.json(
          { error: { code: 'UPSTREAM_ERROR', message: 'La API de F1 no está disponible.' } },
          { status: 502 },
        ),
      ),
    );
    renderApp();

    await userEvent.click(await screen.findByRole('button', { name: /Bahrain Grand Prix/ }));

    expect(await screen.findByText('La API de F1 no está disponible.')).toBeInTheDocument();
    expect(screen.queryByText(/Completa los stints/)).not.toBeInTheDocument();
  });
});
