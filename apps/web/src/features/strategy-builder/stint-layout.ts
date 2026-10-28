import type { Compound } from '@f1/shared';

/** A stint being edited; `laps` is undefined while the input is empty. */
export interface StintRow {
  id: number;
  compound: Compound;
  laps: number | undefined;
}

export interface LaidOutStint {
  id: number;
  /** Position of the row in the form, starting at 1. */
  number: number;
  compound: StintRow['compound'];
  startLap: number;
  endLap: number;
  laps: number;
}

/** Whether a row's lap count can be simulated: a whole number of at least 1. */
export function isValidLapCount(laps: number | undefined): laps is number {
  return laps !== undefined && Number.isInteger(laps) && laps >= 1;
}

/**
 * Places the stints one after another on the race laps.
 * Rows without a valid lap count are skipped and laps beyond the race length are cut; uncovered laps stay empty.
 */
export function layoutStints(rows: StintRow[], totalLaps: number): LaidOutStint[] {
  const stints: LaidOutStint[] = [];
  let covered = 0;
  rows.forEach(({ id, compound, laps }, index) => {
    if (!isValidLapCount(laps) || covered >= totalLaps) return;
    const used = Math.min(laps, totalLaps - covered);
    stints.push({
      id,
      number: index + 1,
      compound,
      startLap: covered + 1,
      endLap: covered + used,
      laps: used,
    });
    covered += used;
  });
  return stints;
}
