import type { RequestHandler } from 'express';
import type { F1Repository } from '../f1/f1-repository.js';
import { listDrivers } from './drivers.service.js';

export function createDriversController(f1Repository: F1Repository) {
  const list: RequestHandler = async (_req, res) => {
    res.json(await listDrivers(f1Repository));
  };

  return { list };
}
