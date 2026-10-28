/** Placeholder for a section that has nothing to show yet; tells the user what to do first. */
export function EmptyState({ children }: { children: string }) {
  return (
    <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
