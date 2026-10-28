import type { SimulationResponse } from '@f1/shared';
import { summarizeTime, type TimeTermKey } from './time-summary';

export interface SimulationComparison {
  /** Seconds, rounded to the millisecond; negative when the current simulation is faster. */
  totalDelta: number;
  /** Seconds per term of the time breakdown; negative when the current one lost less time. */
  terms: Record<TimeTermKey, number>;
}

/** Current minus previous, for the total time and for every term of the time breakdown. */
export function compareSimulations(
  current: SimulationResponse,
  previous: SimulationResponse,
): SimulationComparison {
  const previousTerms = summarizeTime(previous).terms;
  const terms = Object.fromEntries(
    summarizeTime(current).terms.map((term) => [
      term.key,
      term.seconds - previousTerms.find((other) => other.key === term.key)!.seconds,
    ]),
  ) as Record<TimeTermKey, number>;

  // Rounding to the millisecond keeps float noise from turning "same time" into a tiny difference.
  return { totalDelta: Math.round((current.totalTime - previous.totalTime) * 1000) / 1000, terms };
}
