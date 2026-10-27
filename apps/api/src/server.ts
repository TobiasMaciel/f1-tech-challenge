import { createApp } from './app.js';
import { config } from './config.js';
import { createHttpF1Repository } from './f1/http-f1-repository.js';
import { logger } from './logger.js';

const f1Repository = createHttpF1Repository({ baseUrl: config.f1ApiBaseUrl });

createApp({ f1Repository }).listen(config.port, () => {
  logger.info(`API listening on port ${config.port}`);
});
