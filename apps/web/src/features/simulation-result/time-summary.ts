import type { LapBreakdown, SimulationResponse } from '@f1/shared';

export type TimeTermKey = Exclude<keyof LapBreakdown, 'base'> | 'pitStops';

export interface TimeTerm {
  key: TimeTermKey;
  label: string;
  /** Seconds over the whole race; positive is lost time, negative is gained. */
  seconds: number;
}

export interface TimeSummary {
  /** Seconds: laps times the base lap time, what a race with no adjustments would take. */
  reference: number;
  terms: TimeTerm[];
}

/** Spanish names of the lap time terms, in the order they are shown. */
export const TERM_LABELS: Record<TimeTermKey, string> = {
  package: 'Piloto y auto',
  tyrePace: 'Compuesto',
  degradation: 'Desgaste',
  fuel: 'Combustible',
  weather: 'Lluvia',
  pitStops: 'Paradas',
};

/** Adds up, over the whole race, the terms the API already returns for every lap and pit stop. */
export function summarizeTime({ laps, pitStops }: SimulationResponse): TimeSummary {
  const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

  return {
    reference: sum(laps.map((lap) => lap.breakdown.base)),
    terms: (Object.keys(TERM_LABELS) as TimeTermKey[]).map((key) => ({
      key,
      label: TERM_LABELS[key],
      seconds:
        key === 'pitStops'
          ? sum(pitStops.map((stop) => stop.timeLost))
          : sum(laps.map((lap) => lap.breakdown[key])),
    })),
  };
}
