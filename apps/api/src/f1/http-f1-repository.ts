import type { z } from 'zod';
import { AppError } from '../errors.js';
import { logger } from '../logger.js';
import { F1NotFoundError, type F1Repository } from './f1-repository.js';
import {
  circuitsPayloadSchema,
  driversPayloadSchema,
  racesPayloadSchema,
  raceWithCircuitSchema,
  simulationParametersSchema,
  teamsPayloadSchema,
  tyresPayloadSchema,
  weatherSchema,
} from './schemas.js';

interface HttpF1RepositoryOptions {
  baseUrl: string;
  /** Per-request timeout. The upstream sleeps on a free tier, so a cold request can take up to ~60 s. */
  timeoutMs?: number;
}

/** The upstream answered with a non-2xx status. */
class UpstreamStatusError extends Error {
  constructor(readonly status: number) {
    super(`F1 API answered ${status}`);
  }
}

/**
 * F1 API client over native fetch: unwraps `data`, validates with Zod, retries once on network
 * errors and 5xx (never on 4xx or timeouts), and caches successful responses forever
 * (the data is deterministic) and shares in-flight requests. Failures are not cached.
 */
export function createHttpF1Repository({
  baseUrl,
  timeoutMs = 70_000,
}: HttpF1RepositoryOptions): F1Repository {
  const cache = new Map<string, Promise<unknown>>();

  async function requestData(path: string): Promise<unknown> {
    const startedAt = Date.now();
    const response = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(timeoutMs) });
    logger.info(
      { path, status: response.status, durationMs: Date.now() - startedAt },
      'F1 API call',
    );
    if (response.status === 404) throw new F1NotFoundError(path);
    if (!response.ok) throw new UpstreamStatusError(response.status);
    const body = (await response.json()) as { data?: unknown };
    return body.data;
  }

  async function requestWithRetry(path: string): Promise<unknown> {
    try {
      return await requestData(path);
    } catch (error) {
      const isNetworkError = error instanceof TypeError;
      const isServerError = error instanceof UpstreamStatusError && error.status >= 500;
      if (!isNetworkError && !isServerError) throw error;
      logger.warn({ path, err: error }, 'F1 API call failed, retrying once');
      return requestData(path);
    }
  }

  async function fetchAndParse<T>(path: string, schema: z.ZodType<T>, isList: boolean): Promise<T> {
    let data: unknown;
    try {
      data = await requestWithRetry(path);
    } catch (error) {
      const translated = translateError(error, isList);
      if (translated instanceof AppError) {
        logger[translated.status === 504 ? 'warn' : 'error'](
          { path, err: error },
          'F1 API call failed',
        );
      } else {
        logger.warn({ path }, 'F1 API resource not found');
      }
      throw translated;
    }

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      throw new AppError(
        502,
        'UPSTREAM_ERROR',
        'La API de F1 devolvió datos inválidos. Intenta de nuevo en unos minutos.',
      );
    }
    return parsed.data;
  }

  /**
   * Caches the promise, not the value, so concurrent callers share one upstream call.
   * A rejected promise is evicted so the next caller retries.
   * A 404 on a list path is an upstream failure, not a "not found" for the caller.
   */
  function get<T>(path: string, schema: z.ZodType<T>, isList = false): Promise<T> {
    const cached = cache.get(path);
    if (cached) return cached as Promise<T>;

    const pending = fetchAndParse(path, schema, isList);
    cache.set(path, pending);
    pending.catch(() => cache.delete(path));
    return pending;
  }

  const racePath = (raceId: string) => `/api/races/${encodeURIComponent(raceId)}`;

  return {
    getRaces: async () => (await get('/api/races', racesPayloadSchema, true)).races,
    getRace: (raceId) => get(racePath(raceId), raceWithCircuitSchema),
    getWeather: (raceId) => get(`${racePath(raceId)}/weather`, weatherSchema),
    getSimulationParameters: (raceId) =>
      get(`${racePath(raceId)}/simulation-parameters`, simulationParametersSchema),
    getTyres: async () => (await get('/api/tyres', tyresPayloadSchema, true)).tyres,
    getDrivers: async () => (await get('/api/drivers', driversPayloadSchema, true)).drivers,
    getTeams: async () => (await get('/api/teams', teamsPayloadSchema, true)).teams,
    getCircuits: async () => (await get('/api/circuits', circuitsPayloadSchema, true)).circuits,
  };
}

function translateError(error: unknown, isList: boolean): Error {
  if (error instanceof F1NotFoundError && !isList) return error;
  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return new AppError(
      504,
      'UPSTREAM_TIMEOUT',
      'La API de F1 tardó demasiado en responder. Intenta de nuevo en unos minutos.',
    );
  }
  return new AppError(
    502,
    'UPSTREAM_ERROR',
    'No se pudo obtener la información de la API de F1. Intenta de nuevo en unos minutos.',
  );
}
