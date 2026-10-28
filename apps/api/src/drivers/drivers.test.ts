import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createHttpF1Repository } from '../f1/http-f1-repository.js';

const BASE_URL = 'http://f1.test';

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
    {
      id: 'driver-02',
      name: 'Max Verstappen',
      number: 1,
      teamId: 'team-02',
      pace: 0.99,
      consistency: 0.96,
    },
  ],
};

const teamsPayload = {
  teams: [
    { id: 'team-01', name: 'McLaren', carPerformance: 0.99 },
    { id: 'team-02', name: 'Red Bull Racing', carPerformance: 0.97 },
  ],
};

/** Wraps a payload the way the F1 API does. */
const envelope = (data: unknown) => ({ statusCode: 200, code: 'OK', message: 'ok', data });

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function buildApp() {
  return createApp({ f1Repository: createHttpF1Repository({ baseUrl: BASE_URL }) });
}

function mockUpstream(drivers: () => Response) {
  server.use(
    http.get(`${BASE_URL}/api/drivers`, drivers),
    http.get(`${BASE_URL}/api/teams`, () => HttpResponse.json(envelope(teamsPayload))),
  );
}

describe('GET /api/drivers', () => {
  it('responde 200 con cada piloto unido a su equipo', async () => {
    mockUpstream(() => HttpResponse.json(envelope(driversPayload)));

    const response = await request(buildApp()).get('/api/drivers');

    expect(response.status).toBe(200);
    expect(response.body.drivers).toHaveLength(2);
    expect(response.body.drivers[0]).toEqual({
      id: 'driver-01',
      name: 'Lando Norris',
      number: 4,
      pace: 0.98,
      consistency: 0.94,
      team: { id: 'team-01', name: 'McLaren', carPerformance: 0.99 },
    });
  });

  it('responde 502 UPSTREAM_ERROR cuando un piloto referencia un equipo inexistente', async () => {
    const orphan = { drivers: [{ ...driversPayload.drivers[0], teamId: 'team-99' }] };
    mockUpstream(() => HttpResponse.json(envelope(orphan)));

    const response = await request(buildApp()).get('/api/drivers');

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('UPSTREAM_ERROR');
  });
});
