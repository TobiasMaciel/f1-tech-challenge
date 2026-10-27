/** A driver with the team they race for (`GET /api/drivers`). */
export interface DriverWithTeam {
  id: string;
  name: string;
  number: number;
  /** Pace and consistency are values from 0 to 1. */
  pace: number;
  consistency: number;
  team: { id: string; name: string; carPerformance: number };
}

export interface DriversResponse {
  drivers: DriverWithTeam[];
}
