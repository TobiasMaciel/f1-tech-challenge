import { Info, TriangleAlert } from 'lucide-react';
import { describeRainBandWarning, type RainBandWarning } from './rain-band-warnings';

/**
 * One line per stint range whose compound is out of its optimal rain band: a red alert when there is
 * too much rain for the tyre, a neutral note when a rain tyre runs with too little rain.
 */
export function RainBandNotes({ warnings }: { warnings: RainBandWarning[] }) {
  if (warnings.length === 0) return null;

  return (
    <ul aria-label="Avisos de lluvia" className="space-y-1.5 text-sm">
      {warnings.map((warning) => {
        const Icon = warning.side === 'above' ? TriangleAlert : Info;
        return (
          <li key={`${warning.stint}-${warning.fromLap}`} className="flex items-start gap-2">
            <Icon
              className={`mt-0.5 size-4 shrink-0 ${warning.side === 'above' ? 'text-red-500' : 'text-amber-400'}`}
              aria-hidden="true"
            />
            <span>{describeRainBandWarning(warning)}</span>
          </li>
        );
      })}
    </ul>
  );
}
