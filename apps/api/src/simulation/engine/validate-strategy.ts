import type { Stint, StrategyRules } from './types.js';

/** Checks a strategy against the race rules; returns the Spanish description of every problem (empty when valid). */
export function validateStrategy(stints: Stint[], rules: StrategyRules): string[] {
  const problems: string[] = [];

  const totalLaps = stints.reduce((sum, stint) => sum + stint.laps, 0);
  if (totalLaps !== rules.laps) {
    problems.push(`Los stints suman ${totalLaps} vueltas y la carrera tiene ${rules.laps}.`);
  }

  const pitStops = stints.length - 1;
  if (pitStops < rules.minimumPitStops) {
    const plural = rules.minimumPitStops === 1 ? 'parada' : 'paradas';
    problems.push(
      `La carrera exige al menos ${rules.minimumPitStops} ${plural} y la estrategia tiene ${pitStops}.`,
    );
  }

  return problems;
}
