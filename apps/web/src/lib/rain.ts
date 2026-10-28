import type { ForecastSegment } from '@f1/shared';

interface RainLevel {
  label: string;
  /** Tailwind background class of the level. */
  className: string;
  /** Same colour as a hex value, for SVG charts where Tailwind classes do not apply. */
  fill: string;
}

/**
 * Dry to heavy rain, from lowest to highest intensity; each level covers intensities up to `max`.
 * Colours get stronger with the rain and keep white text readable on top.
 */
const RAIN_LEVELS: (RainLevel & { max: number })[] = [
  { max: 0.05, label: 'Seco', className: 'bg-zinc-700', fill: '#3f3f46' },
  { max: 0.25, label: 'Lluvia ligera', className: 'bg-sky-900', fill: '#0c4a6e' },
  { max: 0.5, label: 'Lluvia moderada', className: 'bg-sky-700', fill: '#0369a1' },
  { max: 0.75, label: 'Lluvia fuerte', className: 'bg-blue-600', fill: '#2563eb' },
  { max: 1, label: 'Lluvia muy fuerte', className: 'bg-indigo-600', fill: '#4f46e5' },
];

/** Colour and name for a rain intensity between 0 (dry) and 1 (heavy rain). */
export function getRainLevel(intensity: number): RainLevel {
  return RAIN_LEVELS.find((level) => intensity <= level.max) ?? RAIN_LEVELS.at(-1)!;
}

/** Intensity on its 0-1 scale with its level name: 0.45 -> "0.45 · Lluvia moderada". */
export function describeRain(intensity: number): string {
  return `${intensity.toFixed(2)} · ${getRainLevel(intensity).label}`;
}

/** Whether the intensity is above the "Seco" level. */
export function isRaining(intensity: number): boolean {
  return intensity > RAIN_LEVELS[0]!.max;
}

/**
 * The forecast as one Spanish sentence, merging consecutive segments with the same rain level:
 * "Seco hasta la vuelta 24, lluvia moderada de la 25 a la 46 y lluvia fuerte de la 47 a la 70."
 */
export function describeForecast(forecast: ForecastSegment[]): string {
  const spans: { label: string; fromLap: number; toLap: number }[] = [];
  for (const { fromLap, toLap, rainIntensity } of forecast) {
    const { label } = getRainLevel(rainIntensity);
    const last = spans.at(-1);
    if (last?.label === label) last.toLap = toLap;
    else spans.push({ label, fromLap, toLap });
  }
  if (spans.length === 0) return '';
  if (spans.length === 1) return `${spans[0]!.label} toda la carrera.`;

  const parts = spans.map(({ label, fromLap, toLap }, index) =>
    index === 0
      ? `${label} hasta la vuelta ${toLap}`
      : `${label.toLowerCase()} de la ${fromLap} a la ${toLap}`,
  );
  return `${parts.slice(0, -1).join(', ')} y ${parts.at(-1)}.`;
}
