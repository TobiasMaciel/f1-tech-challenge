import type { LapResult, SimulationResponse } from '@f1/shared';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';
import { getCompoundInfo } from '@/lib/compounds';
import { formatDuration, formatSignedSeconds, getSecondTicks } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/motion';
import { getRainLevel, isRaining } from '@/lib/rain';
import { TERM_LABELS } from './time-summary';

interface LapTimeChartProps {
  result: SimulationResponse;
}

interface RainArea {
  fromLap: number;
  toLap: number;
  label: string;
  fill: string;
}

/** Consecutive rainy laps with the same rain level, so each one is drawn as a single band. */
function getRainAreas(laps: LapResult[]): RainArea[] {
  const areas: RainArea[] = [];
  for (const { lap, rainIntensity } of laps) {
    if (!isRaining(rainIntensity)) continue;
    const { label, fill } = getRainLevel(rainIntensity);
    const last = areas.at(-1);
    if (last && last.label === label && last.toLap === lap - 1) {
      last.toLap = lap;
    } else {
      areas.push({ fromLap: lap, toLap: lap, fill, label });
    }
  }
  return areas;
}

const LAP_TERMS = ['package', 'tyrePace', 'degradation', 'fuel', 'weather'] as const;

function LapTooltip({ active, payload }: TooltipContentProps) {
  const lap = payload?.[0]?.payload as LapResult | undefined;
  if (!active || !lap) return null;

  return (
    <div className="space-y-1 rounded-lg border bg-popover p-3 text-xs tabular-nums shadow-md">
      <p className="font-semibold">
        Vuelta {lap.lap} · {getCompoundInfo(lap.compound).label} · {lap.tyreAge} vueltas de uso
      </p>
      <p>Tiempo {formatDuration(lap.time)}</p>
      <p className="text-muted-foreground">Vuelta base {formatDuration(lap.breakdown.base)}</p>
      {LAP_TERMS.map((key) => (
        <p key={key} className="flex justify-between gap-4">
          <span>{TERM_LABELS[key]}</span>
          <span>{formatSignedSeconds(lap.breakdown[key])}</span>
        </p>
      ))}
    </div>
  );
}

/** X axis ticks: lap 1 and every 10th lap, so labels never collide at the end of the race. */
function getLapTicks(totalLaps: number): number[] {
  const ticks = [1];
  for (let lap = 10; lap <= totalLaps; lap += 10) ticks.push(lap);
  return ticks;
}

const AXIS_TICK = { fill: '#a1a1aa', fontSize: 11 };
/** Kept low so the compound lines stay readable over the rain bands. */
const RAIN_AREA_OPACITY = 0.22;

/** Lap time per lap: one line per stint in its compound colour, rain bands behind, pit stops as vertical markers. */
export function LapTimeChart({ result }: LapTimeChartProps) {
  // Each stint gets its own data key so its line has its own colour and ends where the stint ends.
  const data = result.laps.map((lap) => ({ ...lap, [`stint${lap.stint}`]: lap.time }));
  const rainAreas = getRainAreas(result.laps);
  const usedCompounds = [...new Set(result.stints.map((stint) => stint.compound))];
  const usedRainLevels = [...new Map(rainAreas.map((area) => [area.label, area])).values()];
  const lapTimes = result.laps.map((lap) => lap.time);
  const timeTicks = getSecondTicks(Math.min(...lapTimes), Math.max(...lapTimes));

  return (
    <section aria-labelledby="lap-chart-title" className="space-y-3 rounded-lg border bg-card p-4">
      <h3 id="lap-chart-title" className="font-semibold">
        Tiempo por vuelta
      </h3>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <ul aria-label="Neumáticos" className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <li className="font-medium text-foreground/80">Neumático</li>
          {usedCompounds.map((compound) => {
            const { label, color } = getCompoundInfo(compound);
            return (
              <li key={compound} className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </li>
            );
          })}
        </ul>
        {(usedRainLevels.length > 0 || result.pitStops.length > 0) && (
          <ul aria-label="Pista" className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <li className="font-medium text-foreground/80">Pista</li>
            {usedRainLevels.map(({ label, fill }) => (
              <li key={label} className="flex items-center gap-1.5">
                <span
                  className="size-3 rounded-sm"
                  style={{ backgroundColor: fill, opacity: RAIN_AREA_OPACITY * 2 }}
                />
                {label}
              </li>
            ))}
            {result.pitStops.length > 0 && (
              <li className="flex items-center gap-1.5">
                <span className="h-3 border-l border-dashed border-foreground/70" />
                Parada
              </li>
            )}
          </ul>
        )}
      </div>
      <div className="h-64 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 16, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#ffffff" strokeOpacity={0.08} />
            <XAxis
              type="number"
              dataKey="lap"
              domain={[1, result.laps.length]}
              ticks={getLapTicks(result.laps.length)}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: '#52525b' }}
              label={{ value: 'Vuelta', position: 'insideBottom', offset: -10, ...AXIS_TICK }}
            />
            <YAxis
              width={44}
              domain={[timeTicks[0]!, timeTicks.at(-1)!]}
              ticks={timeTicks}
              // Ticks are whole seconds, so the milliseconds would always read ".000".
              tickFormatter={(seconds: number) => formatDuration(seconds).slice(0, -4)}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
            />
            {rainAreas.map((area) => (
              <ReferenceArea
                key={area.fromLap}
                x1={area.fromLap - 0.5}
                x2={area.toLap + 0.5}
                ifOverflow="hidden"
                fill={area.fill}
                fillOpacity={RAIN_AREA_OPACITY}
                stroke="none"
              />
            ))}
            {result.pitStops.map((stop) => (
              <ReferenceLine
                key={stop.afterLap}
                x={stop.afterLap + 0.5}
                stroke="#e4e4e7"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
              />
            ))}
            {result.stints.map((stint) => (
              <Line
                key={stint.number}
                dataKey={`stint${stint.number}`}
                name={getCompoundInfo(stint.compound).label}
                stroke={getCompoundInfo(stint.compound).color}
                strokeWidth={3}
                // A one-lap stint is a single point, which a line cannot draw.
                dot={
                  stint.laps === 1
                    ? { r: 4, fill: getCompoundInfo(stint.compound).color, strokeWidth: 0 }
                    : false
                }
                isAnimationActive={!prefersReducedMotion()}
                animationDuration={600}
                animationEasing="ease-out"
              />
            ))}
            <Tooltip content={LapTooltip} cursor={{ stroke: '#a1a1aa', strokeOpacity: 0.5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
