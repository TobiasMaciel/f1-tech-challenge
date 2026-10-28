interface SubmitState {
  hasDriver: boolean;
  /** Whether some row is empty or has a lap count that cannot be simulated. */
  hasInvalidStint: boolean;
  assignedLaps: number;
  raceLaps: number;
  stintCount: number;
  minimumPitStops: number;
}

const plural = (count: number, singular: string, pluralForm: string) =>
  `${count} ${count === 1 ? singular : pluralForm}`;

/** Spanish reasons why the strategy cannot be simulated yet (empty when it can). */
export function getSubmitBlockers({
  hasDriver,
  hasInvalidStint,
  assignedLaps,
  raceLaps,
  stintCount,
  minimumPitStops,
}: SubmitState): string[] {
  const blockers: string[] = [];
  if (!hasDriver) blockers.push('Falta elegir un piloto');
  if (hasInvalidStint) blockers.push('Completa las vueltas de cada stint');
  if (assignedLaps < raceLaps) {
    const missing = raceLaps - assignedLaps;
    blockers.push(`${missing === 1 ? 'Falta' : 'Faltan'} ${plural(missing, 'vuelta', 'vueltas')}`);
  }
  if (assignedLaps > raceLaps) {
    const extra = assignedLaps - raceLaps;
    blockers.push(`${extra === 1 ? 'Sobra' : 'Sobran'} ${plural(extra, 'vuelta', 'vueltas')}`);
  }
  if (stintCount - 1 < minimumPitStops) {
    blockers.push(`Se necesita al menos ${plural(minimumPitStops, 'parada', 'paradas')}`);
  }
  return blockers;
}
