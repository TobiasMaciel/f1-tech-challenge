/** Minimum distance, in percent of the bar, between two stop labels on the same line. */
const LABEL_GAP_PERCENT = 12;
const LINE_COUNT = 2;

/**
 * Line (0 or 1) for the label of each stop, given its position in percent of the bar, or `null`
 * when both lines are too close to a previous label: that stop keeps only its tick.
 */
export function placeStopLabels(percents: number[]): (number | null)[] {
  const lastPercentPerLine: number[] = Array(LINE_COUNT).fill(-Infinity);
  return percents.map((percent) => {
    const line = lastPercentPerLine.findIndex((last) => percent - last >= LABEL_GAP_PERCENT);
    if (line === -1) return null;
    lastPercentPerLine[line] = percent;
    return line;
  });
}
