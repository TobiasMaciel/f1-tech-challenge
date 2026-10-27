import { pino } from 'pino';

export const logger = pino({
  redact: ['req.headers.authorization', 'req.headers.cookie'],
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
  transport: process.env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
});
