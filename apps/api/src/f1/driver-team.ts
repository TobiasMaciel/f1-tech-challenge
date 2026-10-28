import type { DriverWithTeam } from '@f1/shared';
import { AppError } from '../errors.js';
import type { Driver, Team } from './schemas.js';

/** Joins a driver with their team; a driver whose team does not exist upstream is a 502. */
export function joinDriverWithTeam({ teamId, ...driver }: Driver, teams: Team[]): DriverWithTeam {
  const team = teams.find((candidate) => candidate.id === teamId);
  if (!team) {
    throw new AppError(
      502,
      'UPSTREAM_ERROR',
      'La API de F1 devolvió un piloto sin equipo conocido.',
    );
  }
  return { ...driver, team };
}
