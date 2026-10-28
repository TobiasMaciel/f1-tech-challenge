import type { Compound, SimulationResponse } from '@f1/shared';
import { getCompoundInfo } from '@/lib/compounds';
import { formatSignedSeconds } from '@/lib/format';
import { isRaining } from '@/lib/rain';
import { summarizeTime, type TimeTermKey } from './time-summary';

/**
 * The terms the strategy decides, each with its article so it reads naturally after "vino".
 * Driver, car and fuel are left out: the strategy cannot change them.
 */
const LOSS_SOURCES: Partial<Record<TimeTermKey, string>> = {
  tyrePace: 'del compuesto',
  degradation: 'del desgaste',
  weather: 'de la lluvia',
  pitStops: 'de las paradas',
};

const RAIN_COMPOUNDS: Compound[] = ['INTERMEDIATE', 'WET'];

/**
 * Plain Spanish sentences about the result: the strategy decision that cost the most time,
 * whether the tyre choice cost time in the rain and in which stint, and whether rain tyres ran on a dry track.
 */
export function buildConclusion(result: SimulationResponse): string {
  const terms = summarizeTime(result).terms.filter((term) => term.key in LOSS_SOURCES);
  const biggest = terms.reduce((max, term) => (term.seconds > max.seconds ? term : max));
  if (biggest.seconds <= 0) {
    return 'Ninguna decisión de la estrategia perdió tiempo frente a la referencia.';
  }

  let text = `La mayor pérdida vino ${LOSS_SOURCES[biggest.key]}: ${formatSignedSeconds(biggest.seconds)}`;
  if (result.laps.some((lap) => lap.rainIntensity > 0)) {
    const worst = result.stints.reduce((max, stint) =>
      stint.weatherLoss > max.weatherLoss ? stint : max,
    );
    const stintLabel = `stint ${worst.number} (${getCompoundInfo(worst.compound).label})`;
    if (worst.weatherLoss <= 0) {
      text += '. Elegiste neumáticos adecuados para la lluvia en toda la carrera';
    } else if (biggest.key === 'weather') {
      // The rain term already is the headline number, so it is not repeated.
      text += `, sobre todo en el ${stintLabel}, con un compuesto fuera de su banda`;
    } else {
      text += `. Los neumáticos perdieron más tiempo con la lluvia en el ${stintLabel}: ${formatSignedSeconds(worst.weatherLoss)}`;
    }
  }

  const rainTyresOnDry = result.laps.some(
    (lap) => RAIN_COMPOUNDS.includes(lap.compound) && !isRaining(lap.rainIntensity),
  );
  if (rainTyresOnDry) {
    text += '. Usaste neumáticos de lluvia en seco: cuestan su ritmo más lento en cada vuelta';
  }
  return `${text}.`;
}
