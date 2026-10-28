import type { Compound } from '@f1/shared';

interface CompoundInfo {
  compound: Compound;
  /** Spanish name shown in the UI. */
  label: string;
  /** Single letter printed on the tyre badge, as on TV graphics. */
  letter: string;
  /** Official Pirelli colour. */
  color: string;
}

/** Every compound, from softest to wettest; use it wherever compounds are listed so the order stays the same. */
export const COMPOUNDS: CompoundInfo[] = [
  { compound: 'SOFT', label: 'Blando', letter: 'S', color: '#e10600' },
  { compound: 'MEDIUM', label: 'Medio', letter: 'M', color: '#ffd12e' },
  { compound: 'HARD', label: 'Duro', letter: 'H', color: '#f5f5f5' },
  { compound: 'INTERMEDIATE', label: 'Intermedio', letter: 'I', color: '#43b02a' },
  { compound: 'WET', label: 'Lluvia extrema', letter: 'W', color: '#0067ad' },
];

export function getCompoundInfo(compound: Compound): CompoundInfo {
  return COMPOUNDS.find((info) => info.compound === compound)!;
}
