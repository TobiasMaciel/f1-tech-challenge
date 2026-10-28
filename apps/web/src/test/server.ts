import type { DriversResponse, RaceDetailResponse, RacesResponse } from '@f1/shared';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const racesResponse: RacesResponse = {
  races: [
    {
      id: 'race-01',
      name: 'Bahrain Grand Prix',
      round: 1,
      date: '2025-04-13',
      laps: 57,
      rainProbability: 0.02,
      circuit: { id: 'circuit-01', name: 'Bahrain International Circuit', country: 'Bahrain' },
    },
    {
      id: 'race-04',
      name: 'British Grand Prix',
      round: 4,
      date: '2025-07-06',
      laps: 52,
      rainProbability: 0.45,
      circuit: { id: 'circuit-04', name: 'Silverstone Circuit', country: 'United Kingdom' },
    },
  ],
};

export const driversResponse: DriversResponse = {
  drivers: [
    {
      id: 'driver-01',
      name: 'Lando Norris',
      number: 4,
      pace: 0.98,
      consistency: 0.94,
      team: { id: 'team-01', name: 'McLaren', carPerformance: 0.99 },
    },
    {
      id: 'driver-02',
      name: 'Max Verstappen',
      number: 1,
      pace: 0.99,
      consistency: 0.96,
      team: { id: 'team-02', name: 'Red Bull Racing', carPerformance: 0.97 },
    },
  ],
};

export const raceDetailResponse: RaceDetailResponse = {
  race: {
    id: 'race-01',
    name: 'Bahrain Grand Prix',
    round: 1,
    date: '2025-04-13',
    laps: 57,
    temperature: 31,
    rainProbability: 0.02,
  },
  circuit: {
    id: 'circuit-01',
    name: 'Bahrain International Circuit',
    country: 'Bahrain',
    type: 'permanent',
    lengthKm: 5.41,
    baseLapTime: 91.5,
    tyreWear: 1,
    overtakingDifficulty: 0.3,
  },
  weather: {
    summary: 'Very hot and completely dry. High thermal tyre stress.',
    forecast: [
      { fromLap: 1, toLap: 19, temperature: 32, rainIntensity: 0 },
      { fromLap: 20, toLap: 57, temperature: 29, rainIntensity: 0.3 },
    ],
  },
  simulationParameters: {
    lapTimeVariance: 0.2,
    pitStopLoss: 22,
    tyreChangeTime: 2.5,
    fuelEffectPerLap: 0.037,
    safetyCarProbability: 0.2,
    minimumPitStops: 1,
  },
  tyres: [
    {
      compound: 'SOFT',
      pace: -1,
      degradation: 0.09,
      wetPerformance: 0.1,
      optimalRainIntensity: { min: 0, max: 0.05 },
    },
    {
      compound: 'MEDIUM',
      pace: -0.4,
      degradation: 0.06,
      wetPerformance: 0.15,
      optimalRainIntensity: { min: 0, max: 0.1 },
    },
    {
      compound: 'HARD',
      pace: 0,
      degradation: 0.04,
      wetPerformance: 0.2,
      optimalRainIntensity: { min: 0, max: 0.1 },
    },
    {
      compound: 'INTERMEDIATE',
      pace: 2.5,
      degradation: 0.05,
      wetPerformance: 0.8,
      optimalRainIntensity: { min: 0.2, max: 0.6 },
    },
    {
      compound: 'WET',
      pace: 4,
      degradation: 0.03,
      wetPerformance: 1,
      optimalRainIntensity: { min: 0.6, max: 1 },
    },
  ],
};

/** Fake backend shared by the web tests; a test overrides it with `server.use(...)`. */
export const server = setupServer(
  http.get('*/api/races', () => HttpResponse.json(racesResponse)),
  http.get('*/api/drivers', () => HttpResponse.json(driversResponse)),
  http.get('*/api/races/race-01', () => HttpResponse.json(raceDetailResponse)),
);
