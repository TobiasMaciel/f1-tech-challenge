import { useAfterDelay } from '@/hooks/use-after-delay';

const SLOW_LOADING_DELAY_MS = 3000;

/** Tells the user the data is still loading, only once loading takes longer than a few seconds. */
export function LoadingNotice({ loading }: { loading: boolean }) {
  const isSlow = useAfterDelay(loading, SLOW_LOADING_DELAY_MS);
  if (!isSlow) return null;

  return <p className="text-sm text-muted-foreground">Cargando datos…</p>;
}
