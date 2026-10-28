import type { DriversResponse } from '@f1/shared';
import { joinDriverWithTeam } from '../f1/driver-team.js';
import type { F1Repository } from '../f1/f1-repository.js';

/** Lists the drivers for the selector, joining each one with their team. */
export async function listDrivers(f1Repository: F1Repository): Promise<DriversResponse> {
  const [drivers, teams] = await Promise.all([f1Repository.getDrivers(), f1Repository.getTeams()]);
  return { drivers: drivers.map((driver) => joinDriverWithTeam(driver, teams)) };
}
