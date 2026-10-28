import { useAfterDelay } from '@/hooks/use-after-delay';

const SLOW_LOADING_DELAY_MS = 3000;

/** Tells the user the data is still loading, only once loading takes longer than a few seconds. */
export function LoadingNotice({ loading }: { loading: boolean }) {
  const isSlow = useAfterDelay(loading, SLOW_LOADING_DELAY_MS);
  if (!isSlow) return null;

  return (
    <div className="text-sm">
      <p className="text-muted-foreground">Cargando datos…</p>
      <p className="text-xs text-muted-foreground/80">
        La primera carga puede tardar hasta un minuto mientras se activa la API externa.
      </p>
    </div>
  );
}
