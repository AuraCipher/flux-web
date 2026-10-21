"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "./reset-password-form";

export function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return <ResetPasswordForm key={token ?? "missing"} token={token} />;
}
