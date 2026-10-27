import type { z } from 'zod';
import { AppError } from './errors.js';

/** Parses `input` with `schema`; an invalid input becomes a 400 VALIDATION_ERROR listing each failing field. */
export function parseOrThrow<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  throw new AppError(
    400,
    'VALIDATION_ERROR',
    'La solicitud no es válida.',
    result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
  );
}
