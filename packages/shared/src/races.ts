/** A race as shown in the race selector (`GET /api/races`). */
export interface RaceSummary {
  id: string;
  name: string;
  round: number;
  date: string;
  laps: number;
  /** Probability from 0 to 1. */
  rainProbability: number;
  circuit: { id: string; name: string; country: string };
}

/** Body of `GET /api/races`. */
export interface RacesResponse {
  races: RaceSummary[];
}
