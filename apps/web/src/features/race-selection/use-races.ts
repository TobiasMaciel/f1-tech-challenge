import type { RacesResponse } from '@f1/shared';
import { useQuery } from '@tanstack/react-query';
import { apiGet, type ApiError } from '@/lib/api-client';

/** Fetches the races for the selector. */
export function useRaces() {
  return useQuery<RacesResponse, ApiError>({
    queryKey: ['races'],
    queryFn: () => apiGet<RacesResponse>('/api/races'),
  });
}
