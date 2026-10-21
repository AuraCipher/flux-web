/**
 * Client for the Flux auth endpoints used by the public recovery and
 * email-verification pages.
 *
 * Rules:
 * - Resolve the API origin from NEXT_PUBLIC_API_BASE_URL. Never hardcode a
 *   production host.
 * - Never log or persist tokens or passwords.
 * - Turn every failure into an AuthApiError with a stable machine code.
 */

const DEV_API_BASE_URL = "http://localhost:3000";
const REQUEST_TIMEOUT_MS = 15_000;

const CONFIG_ERROR_MESSAGE =
  "Flux isn't configured correctly right now. Please try again later.";

export class AuthApiError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly retryable: boolean;

  constructor(
    message: string,
    options: { code: string; status?: number; retryable?: boolean },
  ) {
    super(message);
    this.name = "AuthApiError";
    this.code = options.code;
    this.status = options.status;
    this.retryable = options.retryable ?? false;
  }
}

type ApiRequestInit = {
  method: "GET" | "POST";
  body?: string;
  headers?: Record<string, string>;
};

type ApiEnvelope = {
  success?: unknown;
  data?: unknown;
  error?: unknown;
  code?: unknown;
};

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
  const trimmed = configured?.trim() ?? "";

  if (trimmed.length > 0) {
    try {
      const url = new URL(trimmed);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Unsupported protocol");
      }
      return trimmed.replace(/\/+$/, "");
    } catch {
      throw new AuthApiError(CONFIG_ERROR_MESSAGE, { code: "CONFIG" });
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_API_BASE_URL;
  }

  throw new AuthApiError(CONFIG_ERROR_MESSAGE, { code: "CONFIG" });
}

async function request(
  path: string,
  init: ApiRequestInit,
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(`${baseUrl}${path}`, {
      method: init.method,
      body: init.body,
      headers: {
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
      credentials: "omit",
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof AuthApiError) throw error;

    if (controller.signal.aborted) {
      throw new AuthApiError("The request timed out. Please try again.", {
        code: "TIMEOUT",
        retryable: true,
      });
    }

    throw new AuthApiError(
      "We couldn't reach Flux. Check your connection and try again.",
      { code: "NETWORK", retryable: true },
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function readEnvelope(response: Response): Promise<ApiEnvelope> {
  try {
    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return {};
    }
    return body as ApiEnvelope;
  } catch {
    return {};
  }
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function toApiError(response: Response, body: ApiEnvelope): AuthApiError {
  const code = stringValue(body.code);
  const serverMessage = stringValue(body.error);

  if (response.status === 429 || code === "GLOBAL_RATE_LIMITED") {
    return new AuthApiError(
      "Too many attempts. Please wait a moment and try again.",
      { code: "RATE_LIMITED", status: response.status, retryable: true },
    );
  }

  if (response.status >= 500) {
    return new AuthApiError(
      "Something went wrong on our side. Please try again.",
      { code: code ?? "SERVER", status: response.status, retryable: true },
    );
  }

  if (response.status === 404) {
    return new AuthApiError("This link is no longer available.", {
      code: code ?? "NOT_FOUND",
      status: response.status,
    });
  }

  if (code) {
    return new AuthApiError(
      serverMessage ?? "Please check the link and try again.",
      { code, status: response.status },
    );
  }

  return new AuthApiError("Please check the link and try again.", {
    code: "UNEXPECTED",
    status: response.status,
  });
}

/**
 * Checks a reset token without consuming it (GET, always 200 from the
 * backend). Only the boolean result is returned.
 */
export async function validateResetToken(token: string): Promise<boolean> {
  const response = await request(
    `/auth/reset-password/validate?token=${encodeURIComponent(token)}`,
    { method: "GET" },
  );
  const body = await readEnvelope(response);

  if (!response.ok) {
    throw toApiError(response, body);
  }

  const data = body.data;
  if (body.success !== true || typeof data !== "object" || data === null) {
    throw new AuthApiError("We couldn't check this link. Please try again.", {
      code: "UNEXPECTED",
      status: response.status,
      retryable: true,
    });
  }

  const valid = (data as { valid?: unknown }).valid;
  if (typeof valid !== "boolean") {
    throw new AuthApiError("We couldn't check this link. Please try again.", {
      code: "UNEXPECTED",
      status: response.status,
      retryable: true,
    });
  }

  return valid;
}

/**
 * Consumes a reset token. The backend updates the password, revokes every
 * active session, and marks the token used.
 */
export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<void> {
  const response = await request("/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: input.token, password: input.password }),
  });
  const body = await readEnvelope(response);

  if (!response.ok || body.success !== true) {
    throw toApiError(response, body);
  }
}

/**
 * Verifies an email token. The password is required by the web UI even though
 * the backend still accepts an omitted password for backward compatibility.
 */
export async function verifyEmail(input: {
  token: string;
  password: string;
}): Promise<void> {
  const response = await request("/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: input.token, password: input.password }),
  });
  const body = await readEnvelope(response);

  if (!response.ok || body.success !== true) {
    throw toApiError(response, body);
  }
}

export function authErrorMessage(error: unknown): string {
  if (!(error instanceof AuthApiError)) {
    return "Something went wrong. Please try again.";
  }

  switch (error.code) {
    case "NETWORK":
    case "TIMEOUT":
    case "CONFIG":
    case "RATE_LIMITED":
      return error.message;
    case "SERVER":
      return "Something went wrong on our side. Please try again.";
    case "UNEXPECTED":
    case "NOT_FOUND":
      return "We couldn't complete that request. Please try again.";
    default:
      return error.message || "Something went wrong. Please try again.";
  }
}
