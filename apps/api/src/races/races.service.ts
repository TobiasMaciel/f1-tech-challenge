import type { RaceDetailResponse, RacesResponse } from '@f1/shared';
import { AppError } from '../errors.js';
import type { F1Repository } from '../f1/f1-repository.js';
import { rethrowAsRaceNotFound } from '../f1/race-not-found.js';

/** Lists the races for the selector, joining each one with the name and country of its circuit. */
export async function listRaces(f1Repository: F1Repository): Promise<RacesResponse> {
  const [races, circuits] = await Promise.all([
    f1Repository.getRaces(),
    f1Repository.getCircuits(),
  ]);

  return {
    races: races.map((race) => {
      const circuit = circuits.find((candidate) => candidate.id === race.circuitId);
      if (!circuit) {
        throw new AppError(
          502,
          'UPSTREAM_ERROR',
          'La API de F1 devolvió una carrera sin circuito conocido.',
        );
      }
      return {
        id: race.id,
        name: race.name,
        round: race.round,
        date: race.date,
        laps: race.laps,
        rainProbability: race.rainProbability,
        circuit: { id: circuit.id, name: circuit.name, country: circuit.country },
      };
    }),
  };
}

/** Builds the race screen: the race with its circuit, weather forecast, simulation parameters and tyres. */
export async function getRaceDetail(
  f1Repository: F1Repository,
  raceId: string,
): Promise<RaceDetailResponse> {
  const [race, weather, parameters, tyres] = await Promise.all([
    f1Repository.getRace(raceId),
    f1Repository.getWeather(raceId),
    f1Repository.getSimulationParameters(raceId),
    f1Repository.getTyres(),
  ]).catch(rethrowAsRaceNotFound);
  const { circuit } = race;

  return {
    race: {
      id: race.id,
      name: race.name,
      round: race.round,
      date: race.date,
      laps: race.laps,
      temperature: race.temperature,
      rainProbability: race.rainProbability,
    },
    circuit: {
      id: circuit.id,
      name: circuit.name,
      country: circuit.country,
      type: circuit.type,
      lengthKm: circuit.lengthKm,
      baseLapTime: circuit.baseLapTime,
      tyreWear: circuit.tyreWear,
      overtakingDifficulty: circuit.overtakingDifficulty,
    },
    weather: { summary: weather.summary, forecast: weather.forecast },
    simulationParameters: {
      lapTimeVariance: parameters.lapTimeVariance,
      pitStopLoss: parameters.pitStopLoss,
      tyreChangeTime: parameters.tyreChangeTime,
      fuelEffectPerLap: parameters.fuelEffectPerLap,
      safetyCarProbability: parameters.safetyCarProbability,
      minimumPitStops: parameters.minimumPitStops,
    },
    tyres,
  };
}
