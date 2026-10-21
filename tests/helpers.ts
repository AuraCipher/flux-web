import { vi } from "vitest";

export const VALID_RESET_TOKEN = "a".repeat(64);
export const VALID_VERIFY_TOKEN = "verify-token-123";
export const STRONG_PASSWORD = "Password123";

export type MockFetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

export function jsonResponse(body: unknown, status = 200): MockFetchResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

export function successResponse(message = "OK"): MockFetchResponse {
  return jsonResponse({ success: true, data: { message } });
}

export function failureResponse(
  code: string,
  error: string,
  status = 400,
): MockFetchResponse {
  return jsonResponse({ success: false, error, code }, status);
}

export type MockFetchHandler = (
  url: string,
  init: RequestInit,
) => MockFetchResponse | Promise<MockFetchResponse>;

export function mockFetch(handler: MockFetchHandler) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    return Promise.resolve(handler(url, init ?? {}));
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

export function fetchCallsTo(
  fetchMock: ReturnType<typeof mockFetch>,
  suffix: string,
) {
  return fetchMock.mock.calls.filter(([url]) => String(url).endsWith(suffix));
}
