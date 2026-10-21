import { describe, expect, it } from "vitest";
import {
  getPasswordChecks,
  validateNewPassword,
  validatePasswordConfirmation,
} from "@/lib/password-policy";

describe("validateNewPassword", () => {
  it("accepts a password that satisfies every rule", () => {
    expect(validateNewPassword("Password123")).toEqual({ valid: true });
  });

  it("accepts the 128-character boundary", () => {
    const password = `Aa1${"a".repeat(125)}`;

    expect(password).toHaveLength(128);
    expect(validateNewPassword(password)).toEqual({ valid: true });
  });

  it("rejects a short password", () => {
    expect(validateNewPassword("Aa1")).toEqual({
      valid: false,
      message: "Password must be at least 8 characters",
    });
  });

  it("rejects a password over 128 characters", () => {
    const password = `Aa1${"a".repeat(126)}`;

    expect(password).toHaveLength(129);
    expect(validateNewPassword(password)).toEqual({
      valid: false,
      message: "Password must be under 128 characters",
    });
  });

  it("requires an uppercase letter", () => {
    expect(validateNewPassword("password123")).toEqual({
      valid: false,
      message: "Password must contain at least one uppercase letter",
    });
  });

  it("requires a lowercase letter", () => {
    expect(validateNewPassword("PASSWORD123")).toEqual({
      valid: false,
      message: "Password must contain at least one lowercase letter",
    });
  });

  it("requires a digit", () => {
    expect(validateNewPassword("Password")).toEqual({
      valid: false,
      message: "Password must contain at least one digit",
    });
  });
});

describe("validatePasswordConfirmation", () => {
  it("accepts matching passwords", () => {
    expect(validatePasswordConfirmation("Password123", "Password123")).toEqual({
      valid: true,
    });
  });

  it("rejects mismatched passwords", () => {
    expect(validatePasswordConfirmation("Password123", "Password124")).toEqual({
      valid: false,
      message: "Passwords do not match",
    });
  });
});

describe("getPasswordChecks", () => {
  it("reports each requirement independently", () => {
    expect(getPasswordChecks("Password123")).toEqual([
      { id: "length", label: "8–128 characters", met: true },
      { id: "uppercase", label: "One uppercase letter", met: true },
      { id: "lowercase", label: "One lowercase letter", met: true },
      { id: "digit", label: "One number", met: true },
    ]);
  });

  it("marks missing requirements as unmet", () => {
    expect(getPasswordChecks("abc").map((check) => check.met)).toEqual([
      false,
      false,
      true,
      false,
    ]);
  });
});
