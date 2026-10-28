import { simulationRequestSchema } from '@f1/shared';
import type { RequestHandler } from 'express';
import type { F1Repository } from '../f1/f1-repository.js';
import { parseOrThrow } from '../validation.js';
import { simulateStrategy } from './simulation.service.js';

export function createSimulationController(f1Repository: F1Repository) {
  const simulate: RequestHandler = async (req, res) => {
    const request = parseOrThrow(simulationRequestSchema, req.body);
    res.json(await simulateStrategy(f1Repository, request));
  };

  return { simulate };
}
