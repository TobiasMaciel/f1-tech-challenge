import type { Compound, ForecastSegment, TyreInfo } from '@f1/shared';
import { getCompoundInfo } from '@/lib/compounds';
import { formatSignedSeconds } from '@/lib/format';
import { isRaining } from '@/lib/rain';
import { layoutStints } from './stint-layout';
import type { StintRow } from './stints-form';

export interface RainBandWarning {
  /** Stint position in the form, starting at 1. */
  stint: number;
  compound: Compound;
  fromLap: number;
  toLap: number;
  rainIntensity: number;
  /** Data of the stint's compound: its optimal rain band, pace and wet performance. */
  tyre: TyreInfo;
  /** `above`: too much rain for the tyre. `below`: too little rain for a rain tyre. */
  side: 'above' | 'below';
}

/**
 * Laps, grouped in ranges, where the forecast rain falls outside the optimal band of the stint's compound.
 * It is a hint from data already on screen, not the model: it says nothing about seconds.
 * Laps outside every forecast segment count as dry, like in the simulation.
 */
export function getRainBandWarnings(
  rows: StintRow[],
  forecast: ForecastSegment[],
  tyres: TyreInfo[],
  totalLaps: number,
): RainBandWarning[] {
  const rainAt = (lap: number) =>
    forecast.find((segment) => segment.fromLap <= lap && lap <= segment.toLap)?.rainIntensity ?? 0;
  const warnings: RainBandWarning[] = [];

  for (const stint of layoutStints(rows, totalLaps)) {
    const tyre = tyres.find((candidate) => candidate.compound === stint.compound);
    if (!tyre) continue;
    const band = tyre.optimalRainIntensity;

    for (let lap = stint.startLap; lap <= stint.endLap; lap++) {
      const rainIntensity = rainAt(lap);
      if (rainIntensity >= band.min && rainIntensity <= band.max) continue;

      const last = warnings.at(-1);
      if (
        last?.stint === stint.number &&
        last.toLap === lap - 1 &&
        last.rainIntensity === rainIntensity
      ) {
        last.toLap = lap;
      } else {
        warnings.push({
          stint: stint.number,
          compound: stint.compound,
          fromLap: lap,
          toLap: lap,
          rainIntensity,
          tyre,
          side: rainIntensity > band.max ? 'above' : 'below',
        });
      }
    }
  }
  return warnings;
}

/**
 * Spanish sentence for a warning. Above the band the model penalises the tyre for the missing wet grip;
 * below it, that penalty is `1 - wetPerformance`, so a full wet tyre only pays its slower pace.
 */
export function describeRainBandWarning({
  stint,
  compound,
  fromLap,
  toLap,
  rainIntensity,
  tyre,
  side,
}: RainBandWarning): string {
  const laps = fromLap === toLap ? `vuelta ${fromLap}` : `vueltas ${fromLap}–${toLap}`;
  const rain = rainIntensity.toFixed(2);
  const band = `${tyre.optimalRainIntensity.min.toFixed(2)}–${tyre.optimalRainIntensity.max.toFixed(2)}`;
  const prefix = `Stint ${stint} · ${getCompoundInfo(compound).label}: ${laps}`;
  const pace = `${formatSignedSeconds(tyre.pace)} por vuelta`;

  if (side === 'above') return `${prefix} con lluvia ${rain}, fuera de su banda ${band}`;

  const dry = !isRaining(rainIntensity);
  if (tyre.wetPerformance < 1) {
    const where = dry ? `casi sin lluvia (${rain})` : `con lluvia ${rain}`;
    return `${prefix} ${where}, por debajo de su banda ${band}; pierde por su ritmo, ${pace}, y por quedar fuera de su banda.`;
  }
  return dry
    ? `${prefix} casi sin lluvia (${rain}); en seco solo pierde por su ritmo, ${pace}.`
    : `${prefix} con lluvia ${rain}, por debajo de su banda ${band}; ahí solo pierde por su ritmo, ${pace}.`;
}
