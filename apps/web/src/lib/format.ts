/** 0.45 -> "45 %". */
export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)} %`;
}

/** 1.8 -> "+1.8 s", -1 -> "-1.0 s". */
export function formatSignedSeconds(seconds: number): string {
  const sign = seconds > 0 ? '+' : '';
  return `${sign}${seconds.toFixed(1)} s`;
}

/** 91.5 -> "1:31.500"; from one hour up it adds the hours: 3725.25 -> "1:02:05.250". */
export function formatDuration(seconds: number): string {
  const totalMilliseconds = Math.round(seconds * 1000);
  const hours = Math.floor(totalMilliseconds / 3_600_000);
  const minutes = Math.floor((totalMilliseconds % 3_600_000) / 60_000);
  const rest = ((totalMilliseconds % 60_000) / 1000).toFixed(3).padStart(6, '0');
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}

/** 5270.058 -> "1:27:50.058". */
export function formatRaceTime(seconds: number): string {
  const totalMilliseconds = Math.round(seconds * 1000);
  const hours = Math.floor(totalMilliseconds / 3_600_000);
  const minutes = Math.floor((totalMilliseconds % 3_600_000) / 60_000);
  const rest = ((totalMilliseconds % 60_000) / 1000).toFixed(3).padStart(6, '0');
  return `${hours}:${String(minutes).padStart(2, '0')}:${rest}`;
}

/** Round steps, in seconds, a chart axis can use between two ticks. */
const TICK_STEPS = [1, 2, 5, 10, 20, 30, 60];
const MAX_TICK_INTERVALS = 6;

/** Evenly spaced axis ticks on round seconds that cover `min` to `max`, with at most six intervals. */
export function getSecondTicks(min: number, max: number): number[] {
  const step =
    TICK_STEPS.find(
      (candidate) => Math.ceil(max / candidate) - Math.floor(min / candidate) <= MAX_TICK_INTERVALS,
    ) ?? TICK_STEPS.at(-1)!;
  const first = Math.floor(min / step) * step;
  const last = Math.ceil(max / step) * step;
  return Array.from({ length: (last - first) / step + 1 }, (_, index) => first + index * step);
}
