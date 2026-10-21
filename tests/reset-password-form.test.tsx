import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import type { MockFetchResponse } from "./helpers";
import {
  failureResponse,
  fetchCallsTo,
  jsonResponse,
  mockFetch,
  STRONG_PASSWORD,
  successResponse,
  VALID_RESET_TOKEN,
} from "./helpers";

const VALIDATE_PATH = "/auth/reset-password/validate";
const SUBMIT_PATH = "/auth/reset-password";

function validTokenFetch(
  options: {
    valid?: boolean;
    submit?: () => MockFetchResponse | Promise<MockFetchResponse>;
  } = {},
) {
  return mockFetch((url) => {
    if (url.includes(VALIDATE_PATH)) {
      return jsonResponse({
        success: true,
        data: { valid: options.valid ?? true },
      });
    }

    if (url.endsWith(SUBMIT_PATH)) {
      return options.submit ? options.submit() : successResponse();
    }

    throw new Error(`Unexpected request: ${url}`);
  });
}

function fillForm(
  password = STRONG_PASSWORD,
  confirmation = password,
) {
  fireEvent.change(screen.getByLabelText("New password"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText("Confirm new password"), {
    target: { value: confirmation },
  });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: /^reset password$/i }));
}

describe("ResetPasswordForm", () => {
  it("shows a missing-token state and makes no request", () => {
    const fetchMock = mockFetch(() => {
      throw new Error("should not fetch");
    });

    render(<ResetPasswordForm token={null} />);

    expect(screen.getByText(/missing a reset token/i)).toBeTruthy();
    expect(screen.queryByLabelText("New password")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows a malformed-token state without calling the API", () => {
    const fetchMock = mockFetch(() => {
      throw new Error("should not fetch");
    });

    render(<ResetPasswordForm token="not-a-real-token" />);

    expect(screen.getByText(/isn't valid/i)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("validates the token before showing the form and does not consume it", async () => {
    const fetchMock = validTokenFetch({ valid: true });

    render(<ResetPasswordForm token={VALID_RESET_TOKEN} />);

    expect(await screen.findByLabelText("New password")).toBeTruthy();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      `http://api.test/auth/reset-password/validate?token=${VALID_RESET_TOKEN}`,
    );
    expect(init?.method).toBe("GET");
    expect(fetchCallsTo(fetchMock, SUBMIT_PATH)).toHaveLength(0);
  });

  it("shows the invalid state when the token is not usable", async () => {
    validTokenFetch({ valid: false });

    render(<ResetPasswordForm token={VALID_RESET_TOKEN} />);

    expect(await screen.findByText(/invalid or has expired/i)).toBeTruthy();
    expect(screen.queryByLabelText("New password")).toBeNull();
  });

  it("retries a failed validation call", async () => {
    let attempts = 0;
    const fetchMock = mockFetch((url) => {
      if (url.includes(VALIDATE_PATH)) {
        attempts += 1;
        if (attempts === 1) {
          return Promise.reject(new TypeError("Failed to fetch"));
        }
        return jsonResponse({ success: true, data: { valid: true } });
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    render(<ResetPasswordForm token={VALID_RESET_TOKEN} />);

    expect(await screen.findByText(/couldn't check this link/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(await screen.findByLabelText("New password")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects a weak password before posting", async () => {
    const fetchMock = validTokenFetch();

    render(<ResetPasswordForm token={VALID_RESET_TOKEN} />);
    await screen.findByLabelText("New password");

    fillForm("weak", "weak");
    submit();

    expect(await screen.findByText(/at least 8 characters/i)).toBeTruthy();
    expect(fetchCallsTo(fetchMock, SUBMIT_PATH)).toHaveLength(0);
  });

  it("rejects mismatched passwords before posting", async () => {
    const fetchMock = validTokenFetch();

    render(<ResetPasswordForm token={VALID_RESET_TOKEN} />);
    await screen.findByLabelText("New password");

    fillForm(STRONG_PASSWORD, "Password124");
    submit();

    expect(await screen.findByText(/passwords do not match/i)).toBeTruthy();
    expect(fetchCallsTo(fetchMock, SUBMIT_PATH)).toHaveLength(0);
  });

  it("submits the new password and shows the success state", async () => {
    const fetchMock = validTokenFetch({ submit: () => successResponse() });

    render(<ResetPasswordForm token={VALID_RESET_TOKEN} />);
    await screen.findByLabelText("New password");

    fillForm();
    submit();

    expect(
      await screen.findByText(/your password has been changed/i),
    ).toBeTruthy();

    const postCalls = fetchCallsTo(fetchMock, SUBMIT_PATH);
    expect(postCalls).toHaveLength(1);
    expect(postCalls[0][1]?.method).toBe("POST");
    expect(JSON.parse(String(postCalls[0][1]?.body))).toEqual({
      token: VALID_RESET_TOKEN,
      password: STRONG_PASSWORD,
    });
    expect(screen.queryByLabelText("New password")).toBeNull();
  });

  it("shows the expired state when the token is consumed during submit", async () => {
    validTokenFetch({
      submit: () =>
        failureResponse("TOKEN_EXPIRED", "Invalid or expired reset token"),
    });

    render(<ResetPasswordForm token={VALID_RESET_TOKEN} />);
    await screen.findByLabelText("New password");

    fillForm();
    submit();

    expect(await screen.findByText(/invalid or has expired/i)).toBeTruthy();
    expect(screen.queryByLabelText("New password")).toBeNull();
  });

  it("keeps the form usable after a network failure", async () => {
    validTokenFetch({
      submit: () => Promise.reject(new TypeError("Failed to fetch")),
    });

    render(<ResetPasswordForm token={VALID_RESET_TOKEN} />);
    await screen.findByLabelText("New password");

    fillForm();
    submit();

    expect(await screen.findByText(/couldn't reach flux/i)).toBeTruthy();
    expect(screen.getByLabelText("New password")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /^reset password$/i }),
    ).toBeTruthy();
  });

  it("shows a safe server error and keeps the form", async () => {
    validTokenFetch({
      submit: () =>
        failureResponse("INTERNAL_ERROR", "Internal server error", 500),
    });

    render(<ResetPasswordForm token={VALID_RESET_TOKEN} />);
    await screen.findByLabelText("New password");

    fillForm();
    submit();

    expect(
      await screen.findByText(/something went wrong on our side/i),
    ).toBeTruthy();
    expect(screen.getByLabelText("New password")).toBeTruthy();
  });

  it("prevents duplicate submissions while a request is in flight", async () => {
    let resolveSubmit: (response: MockFetchResponse) => void = () => {};
    const pending = new Promise<MockFetchResponse>((resolve) => {
      resolveSubmit = resolve;
    });

    const fetchMock = validTokenFetch({ submit: () => pending });

    render(<ResetPasswordForm token={VALID_RESET_TOKEN} />);
    await screen.findByLabelText("New password");

    fillForm();
    const button = screen.getByRole("button", {
      name: /^reset password$/i,
    }) as HTMLButtonElement;

    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchCallsTo(fetchMock, SUBMIT_PATH)).toHaveLength(1);
      expect(button.disabled).toBe(true);
    });

    resolveSubmit(successResponse());

    expect(
      await screen.findByText(/your password has been changed/i),
    ).toBeTruthy();
  });

  it("does not persist the token or password in browser storage", async () => {
    validTokenFetch();

    render(<ResetPasswordForm token={VALID_RESET_TOKEN} />);
    await screen.findByLabelText("New password");

    fillForm();
    submit();

    await screen.findByText(/your password has been changed/i);

    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
    expect(document.cookie).toBe("");
  });

  it("never logs the reset token or password", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    validTokenFetch();

    render(<ResetPasswordForm token={VALID_RESET_TOKEN} />);
    await screen.findByLabelText("New password");

    fillForm();
    submit();

    await screen.findByText(/your password has been changed/i);

    const output = [
      ...logSpy.mock.calls,
      ...errorSpy.mock.calls,
      ...warnSpy.mock.calls,
    ]
      .flat()
      .map((value) => String(value))
      .join(" ");

    expect(output).not.toContain(VALID_RESET_TOKEN);
    expect(output).not.toContain(STRONG_PASSWORD);
  });
});
