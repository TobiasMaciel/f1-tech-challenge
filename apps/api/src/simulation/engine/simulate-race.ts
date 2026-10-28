import type {
  LapBreakdown,
  LapResult,
  PitStopResult,
  SimulationResponse,
  StintResult,
} from '@f1/shared';
import { computeLapBreakdown } from './lap-time.js';
import type { SimulationInput, Stint } from './types.js';

const round3 = (value: number) => Math.round(value * 1000) / 1000;

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const lapTimeOf = (breakdown: LapBreakdown) => sum(Object.values(breakdown));

const roundBreakdown = (breakdown: LapBreakdown): LapBreakdown => ({
  base: round3(breakdown.base),
  package: round3(breakdown.package),
  tyrePace: round3(breakdown.tyrePace),
  degradation: round3(breakdown.degradation),
  fuel: round3(breakdown.fuel),
  weather: round3(breakdown.weather),
});

function rainIntensityAt(lap: number, input: SimulationInput): number {
  const segment = input.forecast.find(({ fromLap, toLap }) => lap >= fromLap && lap <= toLap);
  return segment?.rainIntensity ?? 0;
}

/**
 * Simulates the race lap by lap for an already validated strategy.
 * Sums with full precision and rounds every output number to 3 decimals at the end.
 */
export function simulateRace(stints: Stint[], input: SimulationInput): SimulationResponse {
  const pitStopTime = input.parameters.pitStopLoss + input.parameters.tyreChangeTime;
  const laps: LapResult[] = [];
  const stintResults: StintResult[] = [];
  const pitStops: PitStopResult[] = [];
  let totalTime = 0;

  stints.forEach((stint, index) => {
    const tyre = input.tyres.find(({ compound }) => compound === stint.compound);
    if (!tyre) throw new Error(`Missing tyre data for compound ${stint.compound}`);

    const startLap = laps.length + 1;
    const stintBreakdowns: LapBreakdown[] = [];

    for (let tyreAge = 0; tyreAge < stint.laps; tyreAge++) {
      const lap = startLap + tyreAge;
      const rainIntensity = rainIntensityAt(lap, input);
      const breakdown = computeLapBreakdown({ input, tyre, lap, tyreAge, rainIntensity });
      stintBreakdowns.push(breakdown);
      laps.push({
        lap,
        stint: index + 1,
        compound: stint.compound,
        tyreAge,
        rainIntensity,
        time: round3(lapTimeOf(breakdown)),
        breakdown: roundBreakdown(breakdown),
      });
    }

    const stintTime = sum(stintBreakdowns.map(lapTimeOf));
    totalTime += stintTime;
    stintResults.push({
      number: index + 1,
      compound: stint.compound,
      startLap,
      endLap: startLap + stint.laps - 1,
      laps: stint.laps,
      time: round3(stintTime),
      averageLapTime: round3(stintTime / stint.laps),
      degradationLoss: round3(sum(stintBreakdowns.map((lap) => lap.degradation))),
      weatherLoss: round3(sum(stintBreakdowns.map((lap) => lap.weather))),
    });

    const nextStint = stints[index + 1];
    if (nextStint) {
      totalTime += pitStopTime;
      pitStops.push({
        afterLap: startLap + stint.laps - 1,
        fromCompound: stint.compound,
        toCompound: nextStint.compound,
        timeLost: round3(pitStopTime),
      });
    }
  });

  return { totalTime: round3(totalTime), stints: stintResults, pitStops, laps };
}
