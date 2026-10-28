import { useMutation, useQueryClient, type MutateOptions } from '@tanstack/react-query';
import type { SimulationRequest, SimulationResponse } from '@f1/shared';
import { apiPost, type ApiError } from '@/lib/api-client';

/** A successful simulation together with the request that produced it. */
export interface SimulationRun {
  request: SimulationRequest;
  result: SimulationResponse;
}

const SIMULATION_KEY = ['simulation'];

/**
 * Runs a simulation on the API. It lives outside the features so `App` can hand the result
 * to the result feature while the strategy builder only sends the request.
 */
export function useSimulation() {
  const queryClient = useQueryClient();
  const mutation = useMutation<SimulationResponse, ApiError, SimulationRequest>({
    mutationKey: SIMULATION_KEY,
    mutationFn: (request) => apiPost<SimulationResponse>('/api/simulations', request),
  });

  /**
   * Sends the request unless one is already running. The query cache knows about the running request
   * right away, before React re-renders and disables the button, so a double click sends a single POST.
   */
  function simulate(
    request: SimulationRequest,
    options?: MutateOptions<SimulationResponse, ApiError, SimulationRequest>,
  ) {
    if (queryClient.isMutating({ mutationKey: SIMULATION_KEY }) > 0) return;
    mutation.mutate(request, options);
  }

  return { ...mutation, simulate };
}
