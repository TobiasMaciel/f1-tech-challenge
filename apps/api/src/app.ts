import express from 'express';
import { pinoHttp } from 'pino-http';
import type { F1Repository } from './f1/f1-repository.js';
import { createDriversRouter } from './drivers/drivers.routes.js';
import { logger } from './logger.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { createRacesRouter } from './races/races.routes.js';
import { createSimulationRouter } from './simulation/simulation.routes.js';

interface AppDependencies {
  f1Repository: F1Repository;
}

/** Builds the Express app without listening, so tests can use it directly. */
export function createApp({ f1Repository }: AppDependencies) {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    pinoHttp({
      logger,
      // One compact line per request instead of full header dumps.
      serializers: {
        req: (req) => ({ method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
      customLogLevel: (_req, res, error) => {
        if (error || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    }),
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/races', createRacesRouter(f1Repository));
  app.use('/api/drivers', createDriversRouter(f1Repository));
  app.use('/api/simulations', createSimulationRouter(f1Repository));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
