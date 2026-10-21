/**
 * Mirrors backend/src/validators/reset-password.validator.ts.
 * Keep the messages in sync so the web UI and API explain failures the same
 * way. The backend still validates everything server-side.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export function validateNewPassword(password: string): ValidationResult {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return { valid: false, message: "Password must be under 128 characters" };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one digit",
    };
  }

  return { valid: true };
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): ValidationResult {
  if (password !== confirmation) {
    return { valid: false, message: "Passwords do not match" };
  }

  return { valid: true };
}

export type PasswordCheck = {
  id: "length" | "uppercase" | "lowercase" | "digit";
  label: string;
  met: boolean;
};

export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    {
      id: "length",
      label: "8–128 characters",
      met:
        password.length >= PASSWORD_MIN_LENGTH &&
        password.length <= PASSWORD_MAX_LENGTH,
    },
    {
      id: "uppercase",
      label: "One uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "One lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      id: "digit",
      label: "One number",
      met: /[0-9]/.test(password),
    },
  ];
}
