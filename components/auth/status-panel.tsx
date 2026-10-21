import type { ReactNode } from "react";

type Tone = "success" | "error" | "warning" | "neutral";

const toneStyles: Record<Tone, { panel: string; icon: string }> = {
  success: { panel: "border-success/25 bg-success/5", icon: "text-success" },
  error: { panel: "border-error/25 bg-error/5", icon: "text-error" },
  warning: { panel: "border-warning/25 bg-warning/5", icon: "text-warning" },
  neutral: { panel: "border-border bg-elevated", icon: "text-muted" },
};

function StatusIcon({ tone }: { tone: Tone }) {
  if (tone === "success") {
    return (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="m8.5 12.2 2.3 2.3 4.8-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7.5v5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.3" r="1" fill="currentColor" />
    </svg>
  );
}

export function StatusPanel({
  tone,
  title,
  children,
  actions,
}: {
  tone: Tone;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  const styles = toneStyles[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border p-5 ${styles.panel}`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${styles.icon}`}>
          <StatusIcon tone={tone} />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-text">
            {title}
          </h2>
          {children ? (
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
              {children}
            </div>
          ) : null}
          {actions ? (
            <div className="mt-4 flex flex-wrap gap-2.5">{actions}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
