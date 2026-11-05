import { describe, expect, it } from "vitest";
import { validateLogin, validateSignup } from "./auth-form.schema";

describe("authentication validation", () => {
  it("reports both missing login fields", () => {
    expect(validateLogin({ email: "  ", password: "", stayLoggedIn: false })).toEqual([
      "Email is required.",
      "Password is required.",
    ]);
  });
  it.each([true, false])(
    "accepts login regardless of persistence preference %s",
    (stayLoggedIn) => {
      expect(
        validateLogin({ email: "member@example.com", password: "secret", stayLoggedIn }),
      ).toEqual([]);
    },
  );
  it("reports all signup errors together", () => {
    expect(validateSignup({ email: " ", password: "short", confirmPassword: "different" })).toEqual(
      ["Email is required.", "Password must be at least 8 characters.", "Passwords do not match."],
    );
  });
  it.each([7, 8, 9])("enforces the eight-character password boundary (%s)", (length) => {
    const password = "x".repeat(length);
    expect(
      validateSignup({ email: "member@example.com", password, confirmPassword: password }),
    ).toEqual(length < 8 ? ["Password must be at least 8 characters."] : []);
  });
});
