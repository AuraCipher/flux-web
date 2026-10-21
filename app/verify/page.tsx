import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { CheckingState } from "@/components/auth/checking-state";
import { VerifyClient } from "@/components/auth/verify-client";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Verify the email address on your Flux account.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function VerifyPage() {
  return (
    <AuthShell
      eyebrow="Account verification"
      title="Verify your email"
      description="Enter your account password to confirm it's you and activate your account."
    >
      <Suspense
        fallback={<CheckingState label="Preparing your verification…" />}
      >
        <VerifyClient />
      </Suspense>
    </AuthShell>
  );
}
