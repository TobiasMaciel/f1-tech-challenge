import { Router } from 'express';
import type { F1Repository } from '../f1/f1-repository.js';
import { createDriversController } from './drivers.controller.js';

export function createDriversRouter(f1Repository: F1Repository) {
  const controller = createDriversController(f1Repository);
  const router = Router();

  router.get('/', controller.list);

  return router;
}
