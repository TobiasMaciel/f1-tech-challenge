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
  { max: 1, label: 'Lluvia intensa', className: 'bg-indigo-600', fill: '#4f46e5' },
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
