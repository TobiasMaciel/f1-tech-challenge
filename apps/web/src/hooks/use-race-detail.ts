import type { RaceDetailResponse } from '@f1/shared';
import { useQuery } from '@tanstack/react-query';
import { apiGet, type ApiError } from '@/lib/api-client';

/** Fetches the circuit, weather, simulation parameters and tyres of one race. */
export function useRaceDetail(raceId: string) {
  return useQuery<RaceDetailResponse, ApiError>({
    queryKey: ['race', raceId],
    queryFn: () => apiGet<RaceDetailResponse>(`/api/races/${raceId}`),
  });
}
