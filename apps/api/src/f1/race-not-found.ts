import { AppError } from '../errors.js';
import { F1NotFoundError } from './f1-repository.js';

/** For `.catch()` on race requests: turns an upstream 404 into 404 RACE_NOT_FOUND and rethrows anything else. */
export function rethrowAsRaceNotFound(error: unknown): never {
  if (error instanceof F1NotFoundError) {
    throw new AppError(404, 'RACE_NOT_FOUND', 'La carrera no existe.');
  }
  throw error;
}
