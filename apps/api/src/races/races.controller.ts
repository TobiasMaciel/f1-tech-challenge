import { raceIdSchema } from '@f1/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { F1Repository } from '../f1/f1-repository.js';
import { parseOrThrow } from '../validation.js';
import { getRaceDetail, listRaces } from './races.service.js';

const raceParamsSchema = z.object({ raceId: raceIdSchema });

export function createRacesController(f1Repository: F1Repository) {
  const list: RequestHandler = async (_req, res) => {
    res.json(await listRaces(f1Repository));
  };

  const detail: RequestHandler = async (req, res) => {
    const { raceId } = parseOrThrow(raceParamsSchema, req.params);
    res.json(await getRaceDetail(f1Repository, raceId));
  };

  return { list, detail };
}
