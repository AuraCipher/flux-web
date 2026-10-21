import { Spinner } from "./spinner";

export function CheckingState({ label }: { label: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-border bg-elevated px-4 py-3 text-sm text-muted"
      role="status"
    >
      <Spinner className="shrink-0 text-accent" />
      <span>{label}</span>
    </div>
  );
}
