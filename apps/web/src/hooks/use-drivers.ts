import type { DriversResponse } from '@f1/shared';
import { useQuery } from '@tanstack/react-query';
import { apiGet, type ApiError } from '@/lib/api-client';

/** Fetches the drivers with their team for the driver picker. */
export function useDrivers() {
  return useQuery<DriversResponse, ApiError>({
    queryKey: ['drivers'],
    queryFn: () => apiGet<DriversResponse>('/api/drivers'),
  });
}
