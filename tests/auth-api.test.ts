import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AuthApiError,
  authErrorMessage,
  getApiBaseUrl,
  resetPassword,
  validateResetToken,
  verifyEmail,
} from "@/lib/auth-api";
import {
  failureResponse,
  jsonResponse,
  mockFetch,
  STRONG_PASSWORD,
  successResponse,
  VALID_RESET_TOKEN,
  VALID_VERIFY_TOKEN,
} from "./helpers";

const ORIGINAL_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

/** NODE_ENV is typed as read-only in Next's environment types. */
function setNodeEnv(value: string) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://api.test";
});

afterEach(() => {
  restoreEnv("NEXT_PUBLIC_API_BASE_URL", ORIGINAL_API_BASE);
  restoreEnv("NODE_ENV", ORIGINAL_NODE_ENV);
});

describe("getApiBaseUrl", () => {
  it("uses the configured origin and strips trailing slashes", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test///";

    expect(getApiBaseUrl()).toBe("https://api.example.test");
  });

  it("falls back to the local backend in development", () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    setNodeEnv("development");

    expect(getApiBaseUrl()).toBe("http://localhost:3000");
  });

  it("fails closed in production when no API origin is configured", () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    setNodeEnv("production");

    try {
      getApiBaseUrl();
      throw new Error("Expected getApiBaseUrl to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(AuthApiError);
      expect((error as AuthApiError).code).toBe("CONFIG");
    }
  });

  it("rejects a malformed API origin", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "api.example.test";

    expect(() => getApiBaseUrl()).toThrowError(AuthApiError);
  });

  it("rejects a non-http API origin", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "ftp://api.example.test";

    expect(() => getApiBaseUrl()).toThrowError(AuthApiError);
  });
});

describe("validateResetToken", () => {
  it("calls the non-consuming validation endpoint without a body", async () => {
    const fetchMock = mockFetch(() =>
      jsonResponse({ success: true, data: { valid: true } }),
    );

    await expect(validateResetToken(VALID_RESET_TOKEN)).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      `http://api.test/auth/reset-password/validate?token=${VALID_RESET_TOKEN}`,
    );
    expect(init?.method).toBe("GET");
    expect(init?.credentials).toBe("omit");
    expect(init?.cache).toBe("no-store");
    expect(init?.body).toBeUndefined();
  });

  it("returns false for an invalid token", async () => {
    mockFetch(() => jsonResponse({ success: true, data: { valid: false } }));

    await expect(validateResetToken(VALID_RESET_TOKEN)).resolves.toBe(false);
  });

  it("rejects a malformed validation response", async () => {
    mockFetch(() => jsonResponse({ success: true, data: { valid: "yes" } }));

    await expect(validateResetToken(VALID_RESET_TOKEN)).rejects.toMatchObject({
      code: "UNEXPECTED",
    });
  });

  it("maps rate limiting to a retryable error", async () => {
    mockFetch(() =>
      failureResponse("GLOBAL_RATE_LIMITED", "Too many requests", 429),
    );

    await expect(validateResetToken(VALID_RESET_TOKEN)).rejects.toMatchObject({
      code: "RATE_LIMITED",
      retryable: true,
      status: 429,
    });
  });

  it("maps network failures to a retryable error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(validateResetToken(VALID_RESET_TOKEN)).rejects.toMatchObject({
      code: "NETWORK",
      retryable: true,
    });
  });
});

describe("resetPassword", () => {
  it("posts the token and new password", async () => {
    const fetchMock = mockFetch(() => successResponse());

    await resetPassword({
      token: VALID_RESET_TOKEN,
      password: STRONG_PASSWORD,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("http://api.test/auth/reset-password");
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("omit");
    expect(init?.headers).toMatchObject({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      token: VALID_RESET_TOKEN,
      password: STRONG_PASSWORD,
    });
  });

  it("surfaces a token-expired response", async () => {
    mockFetch(() =>
      failureResponse("TOKEN_EXPIRED", "Invalid or expired reset token"),
    );

    await expect(
      resetPassword({ token: VALID_RESET_TOKEN, password: STRONG_PASSWORD }),
    ).rejects.toMatchObject({ code: "TOKEN_EXPIRED", status: 400 });
  });

  it("turns an unreadable 5xx response into a retryable server error", async () => {
    mockFetch(() => ({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error("not json");
      },
    }));

    await expect(
      resetPassword({ token: VALID_RESET_TOKEN, password: STRONG_PASSWORD }),
    ).rejects.toMatchObject({
      code: "SERVER",
      status: 502,
      retryable: true,
    });
  });
});

describe("verifyEmail", () => {
  it("posts the token and current password", async () => {
    const fetchMock = mockFetch(() => successResponse());

    await verifyEmail({
      token: VALID_VERIFY_TOKEN,
      password: STRONG_PASSWORD,
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("http://api.test/auth/verify-email");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      token: VALID_VERIFY_TOKEN,
      password: STRONG_PASSWORD,
    });
  });

  it("surfaces an incorrect-password response", async () => {
    mockFetch(() =>
      failureResponse("INVALID_PASSWORD", "Incorrect password", 403),
    );

    await expect(
      verifyEmail({ token: VALID_VERIFY_TOKEN, password: STRONG_PASSWORD }),
    ).rejects.toMatchObject({ code: "INVALID_PASSWORD", status: 403 });
  });
});

describe("authErrorMessage", () => {
  it("returns the network message for connection failures", () => {
    expect(
      authErrorMessage(
        new AuthApiError("We couldn't reach Flux.", { code: "NETWORK" }),
      ),
    ).toBe("We couldn't reach Flux.");
  });

  it("hides server internals", () => {
    expect(
      authErrorMessage(
        new AuthApiError("stack trace", { code: "SERVER", status: 500 }),
      ),
    ).toBe("Something went wrong on our side. Please try again.");
  });

  it("handles non-API errors", () => {
    expect(authErrorMessage(new Error("boom"))).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
