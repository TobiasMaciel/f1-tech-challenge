import type { StintRow } from './stint-layout';

interface Issue {
  path: PropertyKey[];
  message: string;
}

/**
 * Maps the validation issues of a stint to the row they belong to, keeping the first message per row.
 * Rows still empty are skipped so the user is not shown errors before typing.
 */
export function toRowErrors(issues: Issue[], rows: StintRow[]): Record<number, string> {
  const rowErrors: Record<number, string> = {};
  for (const issue of issues) {
    const [field, index] = issue.path;
    if (field === 'stints' && typeof index === 'number' && rows[index]?.laps !== undefined) {
      rowErrors[index] ??= issue.message;
    }
  }
  return rowErrors;
}
