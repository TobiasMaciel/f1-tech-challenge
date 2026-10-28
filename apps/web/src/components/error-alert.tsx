import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
  message: string;
  onRetry: () => void;
}

/** Error message from the API with a button to try the request again. */
export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4"
    >
      <p className="text-sm">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}
