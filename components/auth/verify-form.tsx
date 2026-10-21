"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button, ButtonAnchor, ButtonLink } from "@/components/ui/button";
import {
  AuthApiError,
  authErrorMessage,
  verifyEmail,
} from "@/lib/auth-api";
import {
  APP_DEEP_LINK,
  openDeepLink,
  VERIFIED_DEEP_LINK,
} from "@/lib/deep-link";
import { hasVerificationToken } from "@/lib/token-format";
import { FormAlert } from "./form-alert";
import { PasswordField } from "./password-field";
import { Spinner } from "./spinner";
import { StatusPanel } from "./status-panel";

type Status = "form" | "invalid" | "success";
type InvalidReason = "missing" | "invalid" | "used" | "expired";

function initialStatus(token: string | null): Status {
  return hasVerificationToken(token) ? "form" : "invalid";
}

function initialInvalidReason(token: string | null): InvalidReason | null {
  return hasVerificationToken(token) ? null : "missing";
}

function invalidReasonCopy(reason: InvalidReason | null): {
  title: string;
  description: string;
} {
  switch (reason) {
    case "missing":
      return {
        title: "This link is missing a verification token",
        description:
          "Open the verification link from your email again, or request a new verification email from the Flux app.",
      };
    case "used":
      return {
        title: "This verification link has already been used",
        description:
          "If your email is already verified, open Flux and sign in. Otherwise, request a new verification email from the app.",
      };
    case "expired":
      return {
        title: "This verification link has expired",
        description:
          "Verification links expire after 24 hours. Request a new verification email from the Flux app.",
      };
    case "invalid":
    default:
      return {
        title: "This verification link is invalid",
        description:
          "The link may be incomplete or altered. Request a new verification email from the Flux app.",
      };
  }
}

export function VerifyForm({ token }: { token: string | null }) {
  const [status, setStatus] = useState<Status>(() => initialStatus(token));
  const [invalidReason, setInvalidReason] = useState<InvalidReason | null>(() =>
    initialInvalidReason(token),
  );
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (status !== "success") return;

    const timer = window.setTimeout(() => {
      openDeepLink(VERIFIED_DEEP_LINK);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [status]);

  function handlePasswordChange(value: string) {
    setPassword(value);
    setPasswordError(null);
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) return;

    setSubmitError(null);

    if (!hasVerificationToken(token)) {
      setInvalidReason("missing");
      setStatus("invalid");
      return;
    }

    if (password.trim().length === 0) {
      setPasswordError("Please enter your password.");
      return;
    }

    if (password.length > 128) {
      setPasswordError("Password must be 128 characters or fewer.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      await verifyEmail({ token, password });
      setPassword("");
      setStatus("success");
    } catch (error) {
      if (error instanceof AuthApiError) {
        switch (error.code) {
          case "INVALID_TOKEN":
          case "USER_NOT_FOUND":
            setPassword("");
            setInvalidReason("invalid");
            setStatus("invalid");
            return;
          case "TOKEN_USED":
            setPassword("");
            setInvalidReason("used");
            setStatus("invalid");
            return;
          case "TOKEN_EXPIRED":
            setPassword("");
            setInvalidReason("expired");
            setStatus("invalid");
            return;
          case "INVALID_PASSWORD":
            setPasswordError(
              "That password doesn't match our records. Try again.",
            );
            return;
          case "VALIDATION_ERROR":
            setSubmitError("Please check your details and try again.");
            return;
          default:
            break;
        }
      }

      setSubmitError(authErrorMessage(error));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  if (status === "invalid") {
    const copy = invalidReasonCopy(invalidReason);

    return (
      <StatusPanel
        tone="error"
        title={copy.title}
        actions={
          <>
            <ButtonAnchor href={APP_DEEP_LINK}>Open Flux</ButtonAnchor>
            <ButtonLink href="/" variant="secondary">
              Back to flux.app
            </ButtonLink>
          </>
        }
      >
        <p>{copy.description}</p>
      </StatusPanel>
    );
  }

  if (status === "success") {
    return (
      <StatusPanel
        tone="success"
        title="Email verified"
        actions={
          <>
            <ButtonAnchor href={VERIFIED_DEEP_LINK}>Open Flux</ButtonAnchor>
            <ButtonLink href="/" variant="secondary">
              Back to flux.app
            </ButtonLink>
          </>
        }
      >
        <p>Your account is now active.</p>
        <p>
          If Flux doesn&apos;t open automatically, launch the app from your home
          screen and sign in.
        </p>
      </StatusPanel>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {submitError ? <FormAlert>{submitError}</FormAlert> : null}

      <PasswordField
        label="Password"
        value={password}
        onChange={handlePasswordChange}
        autoComplete="current-password"
        placeholder="Enter your password"
        error={passwordError}
        disabled={submitting}
        hint="Use the password you normally sign in to Flux with."
      />

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Spinner />
            Verifying…
          </>
        ) : (
          "Verify email"
        )}
      </Button>

      <p className="text-center text-xs leading-relaxed text-faint">
        Your account isn&apos;t verified until you confirm. Opening this page
        doesn&apos;t change anything.
      </p>
    </form>
  );
}
