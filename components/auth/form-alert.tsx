import type { ReactNode } from "react";

type Tone = "error" | "warning" | "success";

const tones: Record<Tone, string> = {
  error: "border-error/30 bg-error/10 text-error",
  warning: "border-warning/30 bg-warning/10 text-warning",
  success: "border-success/30 bg-success/10 text-success",
};

export function FormAlert({
  tone = "error",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`}
    >
      {children}
    </div>
  );
}
