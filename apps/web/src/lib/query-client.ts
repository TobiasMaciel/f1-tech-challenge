import { QueryClient } from '@tanstack/react-query';

/** The app's `QueryClient`; tests use it too so they run with the same defaults. */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // The backend already retries the upstream API; retrying here would only stack waits on a cold start.
        retry: false,
        // Races, drivers and race details never change, so once loaded they stay fresh for the whole session.
        staleTime: Infinity,
        // Offline, TanStack Query would pause the request and leave the section blank; failing shows the error and Reintentar.
        networkMode: 'always',
      },
      mutations: { networkMode: 'always' },
    },
  });
}
