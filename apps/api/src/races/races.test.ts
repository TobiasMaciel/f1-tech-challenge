import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createHttpF1Repository } from '../f1/http-f1-repository.js';

const BASE_URL = 'http://f1.test';

const racesPayload = {
  races: [
    {
      id: 'race-01',
      name: 'Bahrain Grand Prix',
      round: 1,
      date: '2025-04-13',
      circuitId: 'circuit-01',
      laps: 57,
      temperature: 31,
      rainProbability: 0.02,
    },
    {
      id: 'race-02',
      name: 'Monaco Grand Prix',
      round: 2,
      date: '2025-05-25',
      circuitId: 'circuit-02',
      laps: 78,
      temperature: 24,
      rainProbability: 0.15,
    },
  ],
};

const circuitsPayload = {
  circuits: [
    {
      id: 'circuit-01',
      name: 'Bahrain International Circuit',
      country: 'Bahrain',
      type: 'permanent',
      laps: 57,
      lengthKm: 5.412,
      baseLapTime: 91.5,
      pitStopLoss: 22,
      tyreWear: 1.35,
      overtakingDifficulty: 0.3,
    },
    {
      id: 'circuit-02',
      name: 'Circuit de Monaco',
      country: 'Monaco',
      type: 'street',
      laps: 78,
      lengthKm: 3.337,
      baseLapTime: 72.5,
      pitStopLoss: 17,
      tyreWear: 0.8,
      overtakingDifficulty: 0.98,
    },
  ],
};

/** Wraps a payload the way the F1 API does. */
const envelope = (data: unknown) => ({ statusCode: 200, code: 'OK', message: 'ok', data });

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function buildApp(timeoutMs?: number) {
  return createApp({ f1Repository: createHttpF1Repository({ baseUrl: BASE_URL, timeoutMs }) });
}

function mockUpstream(races: () => Response | Promise<Response>) {
  server.use(
    http.get(`${BASE_URL}/api/races`, races),
    http.get(`${BASE_URL}/api/circuits`, () => HttpResponse.json(envelope(circuitsPayload))),
  );
}

describe('GET /api/races', () => {
  it('responde 200 con las carreras y el nombre y país de su circuito', async () => {
    mockUpstream(() => HttpResponse.json(envelope(racesPayload)));

    const response = await request(buildApp()).get('/api/races');

    expect(response.status).toBe(200);
    expect(response.body.races).toHaveLength(2);
    expect(response.body.races[0]).toEqual({
      id: 'race-01',
      name: 'Bahrain Grand Prix',
      round: 1,
      date: '2025-04-13',
      laps: 57,
      rainProbability: 0.02,
      circuit: { id: 'circuit-01', name: 'Bahrain International Circuit', country: 'Bahrain' },
    });
  });

  it('responde 502 UPSTREAM_ERROR cuando la API de F1 responde 500', async () => {
    mockUpstream(() => HttpResponse.json({ statusCode: 500, code: 'X5001' }, { status: 500 }));

    const response = await request(buildApp()).get('/api/races');

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('UPSTREAM_ERROR');
  });

  it('responde 502 UPSTREAM_ERROR cuando la API de F1 responde 404 en un listado', async () => {
    mockUpstream(() => HttpResponse.json({ statusCode: 404, code: 'X4041' }, { status: 404 }));

    const response = await request(buildApp()).get('/api/races');

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('UPSTREAM_ERROR');
  });

  it('consulta una sola vez la API de F1 con peticiones concurrentes en frío', async () => {
    let hits = 0;
    mockUpstream(() => {
      hits += 1;
      return HttpResponse.json(envelope(racesPayload));
    });
    const app = buildApp();

    await Promise.all(Array.from({ length: 10 }, () => request(app).get('/api/races')));

    expect(hits).toBe(1);
  });

  it('vuelve a consultar la API de F1 después de un fallo en vez de cachearlo', async () => {
    let hits = 0;
    mockUpstream(() => {
      hits += 1;
      return hits <= 2
        ? HttpResponse.json({ statusCode: 500, code: 'X5001' }, { status: 500 })
        : HttpResponse.json(envelope(racesPayload));
    });
    const app = buildApp();

    const failed = await request(app).get('/api/races');
    const retried = await request(app).get('/api/races');

    expect(failed.status).toBe(502);
    expect(retried.status).toBe(200);
  });

  it('responde 502 UPSTREAM_ERROR cuando la API de F1 responde 200 con datos vacíos', async () => {
    mockUpstream(() => HttpResponse.json(envelope({ races: [] })));

    const response = await request(buildApp()).get('/api/races');

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('UPSTREAM_ERROR');
  });

  it('responde 502 UPSTREAM_ERROR cuando la API de F1 responde 200 con datos inválidos', async () => {
    mockUpstream(() => HttpResponse.json(envelope({ races: [{ id: 'race-01' }] })));

    const response = await request(buildApp()).get('/api/races');

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('UPSTREAM_ERROR');
  });

  it('responde 504 UPSTREAM_TIMEOUT cuando la API de F1 no responde a tiempo', async () => {
    mockUpstream(async () => {
      await delay(300);
      return HttpResponse.json(envelope(racesPayload));
    });

    const response = await request(buildApp(20)).get('/api/races');

    expect(response.status).toBe(504);
    expect(response.body.error.code).toBe('UPSTREAM_TIMEOUT');
  });

  it('no vuelve a consultar la API de F1 en la segunda petición', async () => {
    let upstreamCalls = 0;
    mockUpstream(() => {
      upstreamCalls++;
      return HttpResponse.json(envelope(racesPayload));
    });
    const app = buildApp();

    await request(app).get('/api/races');
    const second = await request(app).get('/api/races');

    expect(second.status).toBe(200);
    expect(upstreamCalls).toBe(1);
  });

  it('reintenta una vez si la API de F1 falla con 500 y luego responde bien', async () => {
    let upstreamCalls = 0;
    mockUpstream(() => {
      upstreamCalls++;
      return upstreamCalls === 1
        ? HttpResponse.json({}, { status: 500 })
        : HttpResponse.json(envelope(racesPayload));
    });

    const response = await request(buildApp()).get('/api/races');

    expect(response.status).toBe(200);
    expect(upstreamCalls).toBe(2);
  });

  it('reintenta una vez si falla la red y luego responde bien', async () => {
    let upstreamCalls = 0;
    mockUpstream(() => {
      upstreamCalls++;
      return upstreamCalls === 1 ? HttpResponse.error() : HttpResponse.json(envelope(racesPayload));
    });

    const response = await request(buildApp()).get('/api/races');

    expect(response.status).toBe(200);
    expect(upstreamCalls).toBe(2);
  });

  it('no reintenta si la API de F1 responde 4xx', async () => {
    let upstreamCalls = 0;
    mockUpstream(() => {
      upstreamCalls++;
      return HttpResponse.json({}, { status: 400 });
    });

    const response = await request(buildApp()).get('/api/races');

    expect(response.status).toBe(502);
    expect(upstreamCalls).toBe(1);
  });
});

describe('GET /api/races/:raceId', () => {
  const racePayload = { ...racesPayload.races[0], circuit: circuitsPayload.circuits[0] };
  const weatherPayload = {
    raceId: 'race-01',
    summary: 'Very hot and completely dry.',
    forecast: [
      { fromLap: 1, toLap: 19, temperature: 32, rainIntensity: 0 },
      { fromLap: 20, toLap: 57, temperature: 29, rainIntensity: 0.3 },
    ],
  };
  const parametersPayload = {
    raceId: 'race-01',
    lapTimeVariance: 0.15,
    pitStopLoss: 22,
    tyreChangeTime: 2.5,
    fuelEffectPerLap: 0.037,
    safetyCarProbability: 0.2,
    minimumPitStops: 1,
  };
  const tyresPayload = {
    tyres: [
      {
        compound: 'SOFT',
        pace: -1,
        degradation: 0.09,
        wetPerformance: 0.1,
        optimalRainIntensity: { min: 0, max: 0.05 },
      },
    ],
  };

  it('responde 200 con carrera, circuito, clima, parámetros y neumáticos', async () => {
    server.use(
      http.get(`${BASE_URL}/api/races/race-01`, () => HttpResponse.json(envelope(racePayload))),
      http.get(`${BASE_URL}/api/races/race-01/weather`, () =>
        HttpResponse.json(envelope(weatherPayload)),
      ),
      http.get(`${BASE_URL}/api/races/race-01/simulation-parameters`, () =>
        HttpResponse.json(envelope(parametersPayload)),
      ),
      http.get(`${BASE_URL}/api/tyres`, () => HttpResponse.json(envelope(tyresPayload))),
    );

    const response = await request(buildApp()).get('/api/races/race-01');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      race: {
        id: 'race-01',
        name: 'Bahrain Grand Prix',
        round: 1,
        date: '2025-04-13',
        laps: 57,
        temperature: 31,
        rainProbability: 0.02,
      },
      circuit: {
        id: 'circuit-01',
        name: 'Bahrain International Circuit',
        country: 'Bahrain',
        type: 'permanent',
        lengthKm: 5.412,
        baseLapTime: 91.5,
        tyreWear: 1.35,
        overtakingDifficulty: 0.3,
      },
      weather: { summary: weatherPayload.summary, forecast: weatherPayload.forecast },
      simulationParameters: {
        lapTimeVariance: 0.15,
        pitStopLoss: 22,
        tyreChangeTime: 2.5,
        fuelEffectPerLap: 0.037,
        safetyCarProbability: 0.2,
        minimumPitStops: 1,
      },
      tyres: tyresPayload.tyres,
    });
  });

  it('responde 404 RACE_NOT_FOUND cuando la carrera no existe', async () => {
    server.use(
      http.get(`${BASE_URL}/api/races/race-99`, () => HttpResponse.json({}, { status: 404 })),
      http.get(`${BASE_URL}/api/races/race-99/weather`, () =>
        HttpResponse.json({}, { status: 404 }),
      ),
      http.get(`${BASE_URL}/api/races/race-99/simulation-parameters`, () =>
        HttpResponse.json({}, { status: 404 }),
      ),
      http.get(`${BASE_URL}/api/tyres`, () => HttpResponse.json(envelope(tyresPayload))),
    );

    const response = await request(buildApp()).get('/api/races/race-99');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('RACE_NOT_FOUND');
  });

  it('responde 400 VALIDATION_ERROR con el detalle cuando el id tiene formato inválido', async () => {
    const response = await request(buildApp()).get('/api/races/Race_01');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toEqual([{ path: 'raceId', message: expect.any(String) }]);
  });
});
