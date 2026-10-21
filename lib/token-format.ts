/**
 * Token shape checks are a UX guard only. The backend remains the sole
 * authority on whether a token exists, is unused, and is unexpired.
 */

/** Password-reset tokens are 64 lowercase hex characters. */
export const RESET_TOKEN_PATTERN = /^[0-9a-f]{64}$/;

export function hasResetTokenShape(token: string | null): token is string {
  return typeof token === "string" && RESET_TOKEN_PATTERN.test(token);
}

/**
 * Verification tokens are opaque strings today (the backend accepts any
 * non-empty value), so only presence is checked here.
 */
export function hasVerificationToken(token: string | null): token is string {
  return typeof token === "string" && token.trim().length > 0;
}
