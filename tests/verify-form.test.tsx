import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VerifyForm } from "@/components/auth/verify-form";
import { openDeepLink, VERIFIED_DEEP_LINK } from "@/lib/deep-link";
import type { MockFetchResponse } from "./helpers";
import {
  failureResponse,
  fetchCallsTo,
  mockFetch,
  successResponse,
  VALID_VERIFY_TOKEN,
} from "./helpers";

vi.mock("@/lib/deep-link", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/deep-link")>();
  return {
    ...actual,
    openDeepLink: vi.fn(),
  };
});

const SUBMIT_PATH = "/auth/verify-email";

function fillPassword(password: string) {
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: /^verify email$/i }));
}

beforeEach(() => {
  vi.mocked(openDeepLink).mockClear();
});

describe("VerifyForm", () => {
  it("shows a missing-token state and makes no request", () => {
    const fetchMock = mockFetch(() => {
      throw new Error("should not fetch");
    });

    render(<VerifyForm token={null} />);

    expect(screen.getByText(/missing a verification token/i)).toBeTruthy();
    expect(screen.queryByLabelText("Password")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders the password form without contacting the backend", () => {
    const fetchMock = mockFetch(() => {
      throw new Error("should not fetch");
    });

    render(<VerifyForm token={VALID_VERIFY_TOKEN} />);

    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /^verify email$/i }),
    ).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires a password before submitting", () => {
    const fetchMock = mockFetch(() => successResponse());

    render(<VerifyForm token={VALID_VERIFY_TOKEN} />);
    submit();

    expect(screen.getByText(/please enter your password/i)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not treat token shape as authorization", async () => {
    const fetchMock = mockFetch(() =>
      failureResponse("INVALID_TOKEN", "Invalid verification token"),
    );

    render(<VerifyForm token="not-a-real-token" />);

    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();

    fillPassword("Password123");
    submit();

    expect(
      await screen.findByText(/verification link is invalid/i),
    ).toBeTruthy();
    expect(screen.queryByLabelText("Password")).toBeNull();
  });

  it("verifies the email and exposes the app deep link", async () => {
    const fetchMock = mockFetch(() => successResponse());

    render(<VerifyForm token={VALID_VERIFY_TOKEN} />);
    fillPassword("oldpassword");
    submit();

    expect(await screen.findByText(/your account is now active/i)).toBeTruthy();

    const posts = fetchCallsTo(fetchMock, SUBMIT_PATH);
    expect(posts).toHaveLength(1);
    expect(posts[0][1]?.method).toBe("POST");
    expect(JSON.parse(String(posts[0][1]?.body))).toEqual({
      token: VALID_VERIFY_TOKEN,
      password: "oldpassword",
    });

    const deepLink = screen.getByRole("link", { name: /open flux/i });
    expect(deepLink.getAttribute("href")).toBe(VERIFIED_DEEP_LINK);
  });

  it("keeps the form after an incorrect password", async () => {
    mockFetch(() =>
      failureResponse("INVALID_PASSWORD", "Incorrect password", 403),
    );

    render(<VerifyForm token={VALID_VERIFY_TOKEN} />);
    fillPassword("WrongPassword1!");
    submit();

    expect(
      await screen.findByText(/doesn't match our records/i),
    ).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });

  it("explains an expired token", async () => {
    mockFetch(() =>
      failureResponse("TOKEN_EXPIRED", "Verification token has expired"),
    );

    render(<VerifyForm token={VALID_VERIFY_TOKEN} />);
    fillPassword("Password123");
    submit();

    expect(
      await screen.findByText(/verification link has expired/i),
    ).toBeTruthy();
    expect(screen.queryByLabelText("Password")).toBeNull();
  });

  it("explains an already-used token", async () => {
    mockFetch(() =>
      failureResponse("TOKEN_USED", "Verification token has already been used"),
    );

    render(<VerifyForm token={VALID_VERIFY_TOKEN} />);
    fillPassword("Password123");
    submit();

    expect(await screen.findByText(/already been used/i)).toBeTruthy();
    expect(screen.queryByLabelText("Password")).toBeNull();
  });

  it("explains an invalid token", async () => {
    mockFetch(() =>
      failureResponse("INVALID_TOKEN", "Invalid verification token"),
    );

    render(<VerifyForm token={VALID_VERIFY_TOKEN} />);
    fillPassword("Password123");
    submit();

    expect(
      await screen.findByText(/verification link is invalid/i),
    ).toBeTruthy();
    expect(screen.queryByLabelText("Password")).toBeNull();
  });

  it("keeps the form usable after a network failure", async () => {
    mockFetch(() => Promise.reject(new TypeError("Failed to fetch")));

    render(<VerifyForm token={VALID_VERIFY_TOKEN} />);
    fillPassword("Password123");
    submit();

    expect(await screen.findByText(/couldn't reach flux/i)).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /^verify email$/i }),
    ).toBeTruthy();
  });

  it("shows a safe server error and keeps the form", async () => {
    mockFetch(() =>
      failureResponse("INTERNAL_ERROR", "Internal server error", 500),
    );

    render(<VerifyForm token={VALID_VERIFY_TOKEN} />);
    fillPassword("Password123");
    submit();

    expect(
      await screen.findByText(/something went wrong on our side/i),
    ).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });

  it("prevents duplicate submissions while a request is in flight", async () => {
    let resolveSubmit: (response: MockFetchResponse) => void = () => {};
    const pending = new Promise<MockFetchResponse>((resolve) => {
      resolveSubmit = resolve;
    });

    const fetchMock = mockFetch(() => pending);

    render(<VerifyForm token={VALID_VERIFY_TOKEN} />);
    fillPassword("Password123");

    const button = screen.getByRole("button", {
      name: /^verify email$/i,
    }) as HTMLButtonElement;

    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchCallsTo(fetchMock, SUBMIT_PATH)).toHaveLength(1);
      expect(button.disabled).toBe(true);
    });

    resolveSubmit(successResponse());

    expect(await screen.findByText(/your account is now active/i)).toBeTruthy();
  });

  it("rejects an overlong password before posting", () => {
    const fetchMock = mockFetch(() => successResponse());

    render(<VerifyForm token={VALID_VERIFY_TOKEN} />);
    fillPassword("a".repeat(129));
    submit();

    expect(screen.getByText(/128 characters or fewer/i)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not persist the token or password in browser storage", async () => {
    mockFetch(() => successResponse());

    render(<VerifyForm token={VALID_VERIFY_TOKEN} />);
    fillPassword("Password123");
    submit();

    await screen.findByText(/your account is now active/i);

    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
    expect(document.cookie).toBe("");
  });
});
