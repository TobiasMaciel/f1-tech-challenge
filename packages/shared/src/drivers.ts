/** A driver with the team they race for (`GET /api/drivers`). */
export interface DriverWithTeam {
  id: string;
  name: string;
  number: number;
  /** From 0 to 1; higher is faster. */
  pace: number;
  /** From 0 to 1; higher is more consistent. */
  consistency: number;
  /** `carPerformance` goes from 0 to 1; higher is faster. */
  team: { id: string; name: string; carPerformance: number };
}

/** Body of `GET /api/drivers`. */
export interface DriversResponse {
  drivers: DriverWithTeam[];
}
