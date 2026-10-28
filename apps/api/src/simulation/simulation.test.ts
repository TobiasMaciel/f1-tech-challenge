import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createHttpF1Repository } from '../f1/http-f1-repository.js';

const BASE_URL = 'http://f1.test';

/** Wraps a payload the way the F1 API does. */
const envelope = (data: unknown) => ({ statusCode: 200, code: 'OK', message: 'ok', data });
const notFound = () => HttpResponse.json({}, { status: 404 });

const racePayload = {
  id: 'race-01',
  name: 'Bahrain Grand Prix',
  round: 1,
  date: '2025-04-13',
  circuitId: 'circuit-01',
  laps: 57,
  temperature: 31,
  rainProbability: 0.02,
  circuit: {
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
};
const weatherPayload = {
  raceId: 'race-01',
  summary: 'Very hot and completely dry.',
  forecast: [{ fromLap: 1, toLap: 57, temperature: 32, rainIntensity: 0 }],
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
    {
      compound: 'HARD',
      pace: 0,
      degradation: 0.03,
      wetPerformance: 0.2,
      optimalRainIntensity: { min: 0, max: 0.1 },
    },
  ],
};
const driversPayload = {
  drivers: [
    {
      id: 'driver-01',
      name: 'Lando Norris',
      number: 4,
      teamId: 'team-01',
      pace: 0.98,
      consistency: 0.94,
    },
  ],
};
const teamsPayload = { teams: [{ id: 'team-01', name: 'McLaren', carPerformance: 0.99 }] };

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/** Mocks the F1 API for race-01; any other race id answers 404. */
function mockUpstream() {
  server.use(
    http.get(`${BASE_URL}/api/races/race-01`, () => HttpResponse.json(envelope(racePayload))),
    http.get(`${BASE_URL}/api/races/race-01/weather`, () =>
      HttpResponse.json(envelope(weatherPayload)),
    ),
    http.get(`${BASE_URL}/api/races/race-01/simulation-parameters`, () =>
      HttpResponse.json(envelope(parametersPayload)),
    ),
    http.get(`${BASE_URL}/api/races/:raceId`, notFound),
    http.get(`${BASE_URL}/api/races/:raceId/weather`, notFound),
    http.get(`${BASE_URL}/api/races/:raceId/simulation-parameters`, notFound),
    http.get(`${BASE_URL}/api/tyres`, () => HttpResponse.json(envelope(tyresPayload))),
    http.get(`${BASE_URL}/api/drivers`, () => HttpResponse.json(envelope(driversPayload))),
    http.get(`${BASE_URL}/api/teams`, () => HttpResponse.json(envelope(teamsPayload))),
  );
}

function simulate(body: unknown) {
  const app = createApp({ f1Repository: createHttpF1Repository({ baseUrl: BASE_URL }) });
  return request(app)
    .post('/api/simulations')
    .send(body as object);
}

const validBody = {
  raceId: 'race-01',
  driverId: 'driver-01',
  stints: [
    { compound: 'SOFT', laps: 20 },
    { compound: 'HARD', laps: 37 },
  ],
};

describe('POST /api/simulations', () => {
  it('responde 200 con el tiempo total, los stints, las paradas y las vueltas', async () => {
    mockUpstream();

    const response = await simulate(validBody);

    expect(response.status).toBe(200);
    expect(response.body.totalTime).toBe(5289.239);
    expect(response.body.stints).toHaveLength(2);
    expect(response.body.pitStops).toHaveLength(1);
    expect(response.body.laps).toHaveLength(57);
  });

  it('responde 400 VALIDATION_ERROR con el detalle de cada campo inválido', async () => {
    mockUpstream();

    const response = await simulate({ ...validBody, stints: [{ compound: 'SOFT', laps: 0 }] });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toEqual([
      { path: 'stints.0.laps', message: 'Debe tener al menos 1 vuelta.' },
    ]);
  });

  it('responde los detalles de validación genéricos en español', async () => {
    mockUpstream();

    const response = await simulate({ ...validBody, stints: [{ compound: 'ULTRA', laps: 57 }] });

    expect(response.status).toBe(400);
    expect(response.body.error.details).toEqual([
      {
        path: 'stints.0.compound',
        message: expect.stringMatching(/^Opción inválida: se esperaba una de "SOFT"/),
      },
    ]);
  });

  it('responde 422 INVALID_STRATEGY cuando las vueltas no suman las de la carrera', async () => {
    mockUpstream();

    const response = await simulate({
      ...validBody,
      stints: [
        { compound: 'SOFT', laps: 20 },
        { compound: 'HARD', laps: 30 },
      ],
    });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('INVALID_STRATEGY');
    expect(response.body.error.message).toBe('Los stints suman 50 vueltas y la carrera tiene 57.');
    expect(response.body.error.details).toEqual([
      { path: 'stints', message: 'Los stints suman 50 vueltas y la carrera tiene 57.' },
    ]);
  });

  it('responde 400 VALIDATION_ERROR cuando el id de la carrera tiene formato inválido', async () => {
    mockUpstream();

    const response = await simulate({ ...validBody, raceId: 'Race_01' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toEqual([{ path: 'raceId', message: expect.any(String) }]);
  });

  it('responde 502 UPSTREAM_ERROR cuando la API de F1 no tiene datos de un neumático de la estrategia', async () => {
    mockUpstream();
    server.use(
      http.get(`${BASE_URL}/api/tyres`, () =>
        HttpResponse.json(envelope({ tyres: tyresPayload.tyres.slice(0, 1) })),
      ),
    );

    const response = await simulate(validBody);

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('UPSTREAM_ERROR');
  });

  it('responde 404 RACE_NOT_FOUND cuando la carrera no existe', async () => {
    mockUpstream();

    const response = await simulate({ ...validBody, raceId: 'race-99' });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('RACE_NOT_FOUND');
  });

  it('responde 404 DRIVER_NOT_FOUND cuando el piloto no existe', async () => {
    mockUpstream();

    const response = await simulate({ ...validBody, driverId: 'driver-99' });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('DRIVER_NOT_FOUND');
  });
});
