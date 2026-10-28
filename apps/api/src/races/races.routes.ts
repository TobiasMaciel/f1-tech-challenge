import { Router } from 'express';
import type { F1Repository } from '../f1/f1-repository.js';
import { createRacesController } from './races.controller.js';

export function createRacesRouter(f1Repository: F1Repository) {
  const controller = createRacesController(f1Repository);
  const router = Router();

  router.get('/', controller.list);
  router.get('/:raceId', controller.detail);

  return router;
}
