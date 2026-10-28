import { Plus, Trash2 } from 'lucide-react';
import { CompoundBadge } from '@/components/compound-badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COMPOUNDS } from '@/lib/compounds';
import { cn } from '@/lib/utils';
import type { StintRow } from './stint-layout';

interface StintsFormProps {
  rows: StintRow[];
  raceLaps: number;
  /** Sum of the valid lap counts typed into the rows. */
  assignedLaps: number;
  /** Whether some row is empty or invalid; the counter is never shown as complete then. */
  hasInvalidStint: boolean;
  /** Validation message per row index, only for rows the user already filled in. */
  rowErrors: Record<number, string>;
  /** Message from the API about the last simulation attempt. */
  submitError: string | undefined;
  canSubmit: boolean;
  /** Why the strategy cannot be simulated yet; shown next to the button. */
  blockers: string[];
  isSubmitting: boolean;
  onChangeRow: (id: number, changes: Partial<Omit<StintRow, 'id'>>) => void;
  onAddRow: () => void;
  onRemoveRow: (id: number) => void;
  onSubmit: () => void;
}

const DIGITS_ONLY = /^\d*$/;

const COMPOUND_ITEMS = COMPOUNDS.map(({ compound, label }) => ({ value: compound, label }));

/** Editable list of stints with the lap counter, the API error and the submit button. */
export function StintsForm({
  rows,
  raceLaps,
  assignedLaps,
  hasInvalidStint,
  rowErrors,
  submitError,
  canSubmit,
  blockers,
  isSubmitting,
  onChangeRow,
  onAddRow,
  onRemoveRow,
  onSubmit,
}: StintsFormProps) {
  return (
    <form
      aria-label="Stints de la estrategia"
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <ul className="space-y-2">
        {rows.map((row, index) => (
          <li key={row.id} className="space-y-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="w-5 shrink-0 text-sm whitespace-nowrap text-muted-foreground tabular-nums sm:w-14">
                <span className="max-sm:sr-only">Stint </span>
                {index + 1}
              </span>
              <CompoundBadge compound={row.compound} />
              <Select
                items={COMPOUND_ITEMS}
                value={row.compound}
                onValueChange={(compound) => compound && onChangeRow(row.id, { compound })}
              >
                <SelectTrigger
                  aria-label={`Compuesto del stint ${index + 1}`}
                  className="min-w-0 flex-1 sm:w-40 sm:flex-none"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPOUNDS.map(({ compound, label }) => (
                    <SelectItem key={compound} value={compound}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                aria-label={`Vueltas del stint ${index + 1}`}
                aria-invalid={rowErrors[index] !== undefined}
                value={row.laps ?? ''}
                onChange={(event) => {
                  const text = event.target.value;
                  // Digits only, so values like "1e3" or "1.5" never reach the strategy.
                  if (!DIGITS_ONLY.test(text)) return;
                  onChangeRow(row.id, { laps: text === '' ? undefined : Number(text) });
                }}
                className="h-8 w-14 shrink-0 rounded-lg border border-input sm:w-20 bg-transparent px-2.5 text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Quitar stint ${index + 1}`}
                disabled={rows.length === 1}
                onClick={() => onRemoveRow(row.id)}
              >
                <Trash2 />
              </Button>
            </div>
            {rowErrors[index] && (
              <p className="pl-7 text-sm text-destructive sm:pl-17">{rowErrors[index]}</p>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="button" variant="outline" onClick={onAddRow}>
          <Plus />
          Agregar stint
        </Button>
        <p
          aria-live="polite"
          className={cn(
            'text-sm font-medium tabular-nums',
            assignedLaps > raceLaps
              ? 'text-amber-400'
              : assignedLaps === raceLaps && !hasInvalidStint
                ? 'text-emerald-400'
                : 'text-muted-foreground',
          )}
        >
          {assignedLaps} / {raceLaps} vueltas
        </p>
      </div>

      {submitError && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm"
        >
          {submitError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit || isSubmitting}
          className="w-full px-6 sm:w-auto"
        >
          {isSubmitting ? 'Simulando…' : 'Simular'}
        </Button>
        {blockers.length > 0 && (
          <ul className="text-sm text-muted-foreground">
            {blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
