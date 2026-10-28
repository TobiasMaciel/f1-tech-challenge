import { Router } from 'express';
import type { F1Repository } from '../f1/f1-repository.js';
import { createSimulationController } from './simulation.controller.js';

export function createSimulationRouter(f1Repository: F1Repository) {
  const controller = createSimulationController(f1Repository);
  const router = Router();

  router.post('/', controller.simulate);

  return router;
}
