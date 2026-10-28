import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { App } from '@/App';
import { createQueryClient } from '@/lib/query-client';

/** Renders the whole app with a fresh query client, so no test sees another's cache. */
export function renderApp() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <App />
    </QueryClientProvider>,
  );
}
