import { z } from 'zod';

/** Race identifier, shared by the `:raceId` route parameter and the simulation request. */
export const raceIdSchema = z
  .string()
  .max(64, 'El identificador es demasiado largo.')
  .regex(/^[a-z0-9-]+$/, 'El identificador solo admite minúsculas, números y guiones.');
