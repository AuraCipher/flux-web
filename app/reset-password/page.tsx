import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { CheckingState } from "@/components/auth/checking-state";
import { ResetPasswordClient } from "@/components/auth/reset-password-client";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your Flux account.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Create a new password"
      description="Choose a strong password to secure your account. Resetting your password signs out all active sessions."
    >
      <Suspense fallback={<CheckingState label="Checking your reset link…" />}>
        <ResetPasswordClient />
      </Suspense>
    </AuthShell>
  );
}
