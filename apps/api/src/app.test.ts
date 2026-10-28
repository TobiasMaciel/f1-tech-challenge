import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { createHttpF1Repository } from './f1/http-f1-repository.js';

const app = createApp({ f1Repository: createHttpF1Repository({ baseUrl: 'http://f1.test' }) });

describe('GET /api/health', () => {
  it('responde 200 con el estado ok', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('responde 404 con el formato de error para rutas desconocidas', async () => {
    const response = await request(app).get('/api/nope');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});

describe('body demasiado grande', () => {
  it('responde 413 PAYLOAD_TOO_LARGE en lugar de un error interno', async () => {
    const response = await request(app)
      .post('/api/simulations')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ padding: 'x'.repeat(200_000) }));

    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
    expect(response.body.error.message).toMatch(/demasiado grande/);
  });
});

describe('parámetros con codificación de porcentaje inválida', () => {
  it.each(['/api/races/%', '/api/races/%E0%A4%A'])(
    'responde 400 VALIDATION_ERROR para %s',
    async (path) => {
      const response = await request(app).get(path);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('La solicitud no es válida.');
    },
  );
});

describe('cabecera x-powered-by', () => {
  it('no revela el framework', async () => {
    const response = await request(app).get('/api/health');

    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});

describe('body con JSON mal formado', () => {
  it('responde 400 VALIDATION_ERROR en lugar de un error interno', async () => {
    const response = await request(app)
      .post('/api/simulations')
      .set('Content-Type', 'application/json')
      .send('{"raceId": ');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
