"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button, ButtonAnchor, ButtonLink } from "@/components/ui/button";
import {
  AuthApiError,
  authErrorMessage,
  resetPassword,
  validateResetToken,
} from "@/lib/auth-api";
import { APP_DEEP_LINK } from "@/lib/deep-link";
import {
  validateNewPassword,
  validatePasswordConfirmation,
} from "@/lib/password-policy";
import { hasResetTokenShape } from "@/lib/token-format";
import { CheckingState } from "./checking-state";
import { FormAlert } from "./form-alert";
import { PasswordChecklist } from "./password-checklist";
import { PasswordField } from "./password-field";
import { Spinner } from "./spinner";
import { StatusPanel } from "./status-panel";

type Status = "checking" | "form" | "invalid" | "check-error" | "success";
type InvalidReason = "missing" | "malformed" | "expired";

function initialStatus(token: string | null): Status {
  if (!token) return "invalid";
  return hasResetTokenShape(token) ? "checking" : "invalid";
}

function initialInvalidReason(token: string | null): InvalidReason | null {
  if (!token) return "missing";
  return hasResetTokenShape(token) ? null : "malformed";
}

function invalidReasonCopy(reason: InvalidReason | null): {
  title: string;
  description: string;
} {
  switch (reason) {
    case "missing":
      return {
        title: "This link is missing a reset token",
        description:
          "Open the reset link from your email again, or request a new one from the Flux app.",
      };
    case "malformed":
      return {
        title: "This reset link isn't valid",
        description:
          "The link appears to be incomplete or altered. Request a new reset link from the Flux app.",
      };
    case "expired":
    default:
      return {
        title: "This reset link is invalid or has expired",
        description:
          "Reset links expire 15 minutes after they're requested and can only be used once. Request a new one from the Flux app.",
      };
  }
}

export function ResetPasswordForm({ token }: { token: string | null }) {
  const [status, setStatus] = useState<Status>(() => initialStatus(token));
  const [invalidReason, setInvalidReason] = useState<InvalidReason | null>(() =>
    initialInvalidReason(token),
  );
  const [checkAttempt, setCheckAttempt] = useState(0);
  const [checkError, setCheckError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmationError, setConfirmationError] = useState<string | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!hasResetTokenShape(token)) return;

    let active = true;
    setStatus("checking");
    setCheckError(null);

    validateResetToken(token)
      .then((valid) => {
        if (!active) return;

        if (valid) {
          setStatus("form");
        } else {
          setInvalidReason("expired");
          setStatus("invalid");
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setCheckError(authErrorMessage(error));
        setStatus("check-error");
      });

    return () => {
      active = false;
    };
  }, [token, checkAttempt]);

  function retryCheck() {
    setCheckAttempt((attempt) => attempt + 1);
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setPasswordError(null);
    setSubmitError(null);
  }

  function handleConfirmationChange(value: string) {
    setConfirmation(value);
    setConfirmationError(null);
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current || !hasResetTokenShape(token)) return;

    setSubmitError(null);

    const passwordResult = validateNewPassword(password);
    const confirmationResult = validatePasswordConfirmation(
      password,
      confirmation,
    );

    setPasswordError(passwordResult.valid ? null : passwordResult.message);
    setConfirmationError(
      confirmationResult.valid ? null : confirmationResult.message,
    );

    if (!passwordResult.valid || !confirmationResult.valid) return;

    submittingRef.current = true;
    setSubmitting(true);

    try {
      await resetPassword({ token, password });
      setPassword("");
      setConfirmation("");
      setStatus("success");
    } catch (error) {
      if (error instanceof AuthApiError && error.code === "TOKEN_EXPIRED") {
        setPassword("");
        setConfirmation("");
        setInvalidReason("expired");
        setStatus("invalid");
        return;
      }

      if (error instanceof AuthApiError && error.code === "VALIDATION_ERROR") {
        setSubmitError("Please check your password and try again.");
        return;
      }

      setSubmitError(authErrorMessage(error));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  if (status === "checking") {
    return <CheckingState label="Checking your reset link…" />;
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

  if (status === "check-error") {
    return (
      <StatusPanel
        tone="error"
        title="We couldn't check this link"
        actions={
          <>
            <Button type="button" onClick={retryCheck}>
              Try again
            </Button>
            <ButtonLink href="/" variant="secondary">
              Back to flux.app
            </ButtonLink>
          </>
        }
      >
        <p>{checkError ?? "Check your connection and try again."}</p>
      </StatusPanel>
    );
  }

  if (status === "success") {
    return (
      <StatusPanel
        tone="success"
        title="Password reset"
        actions={
          <>
            <ButtonAnchor href={APP_DEEP_LINK}>Open Flux</ButtonAnchor>
            <ButtonLink href="/" variant="secondary">
              Back to flux.app
            </ButtonLink>
          </>
        }
      >
        <p>
          Your password has been changed. For security, all active sessions
          have been signed out.
        </p>
        <p>Open the Flux app and sign in with your new password.</p>
      </StatusPanel>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {submitError ? <FormAlert>{submitError}</FormAlert> : null}

      <div>
        <PasswordField
          label="New password"
          value={password}
          onChange={handlePasswordChange}
          autoComplete="new-password"
          placeholder="Enter a new password"
          error={passwordError}
          disabled={submitting}
        />
        <PasswordChecklist password={password} />
      </div>

      <PasswordField
        label="Confirm new password"
        value={confirmation}
        onChange={handleConfirmationChange}
        autoComplete="new-password"
        placeholder="Re-enter your new password"
        error={confirmationError}
        disabled={submitting}
      />

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Spinner />
            Resetting password…
          </>
        ) : (
          "Reset password"
        )}
      </Button>

      <p className="text-center text-xs leading-relaxed text-faint">
        Reset links expire 15 minutes after they&apos;re requested and can only
        be used once.
      </p>
    </form>
  );
}
