"use client";

import { useSearchParams } from "next/navigation";
import { VerifyForm } from "./verify-form";

export function VerifyClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return <VerifyForm key={token ?? "missing"} token={token} />;
}
