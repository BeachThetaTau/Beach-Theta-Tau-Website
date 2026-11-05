import type { CallableRequest } from "firebase-functions/v2/https";
import { describe, expect, it } from "vitest";
import { requireAuthenticated, requireRole } from "../src/shared/require-role";

const request = (token?: Record<string, unknown>) =>
  ({ auth: token ? { uid: "member-1", token } : undefined }) as CallableRequest<unknown>;

describe("callable authorization", () => {
  it("requires authentication before checking claims", () => {
    expect(() => requireAuthenticated(request())).toThrow(
      expect.objectContaining({ code: "unauthenticated" }),
    );
    expect(() => requireRole(request(), "admin")).toThrow(
      expect.objectContaining({ code: "unauthenticated" }),
    );
  });
  it.each([{ role: "admin" }, { roles: ["member", "admin"] }])(
    "accepts admin claims %j",
    (claims) => {
      const input = request(claims);
      expect(requireRole(input, "admin")).toBe(input.auth);
      expect(requireAuthenticated(input)).toBe(input.auth);
    },
  );
  it.each([
    {},
    { role: "member" },
    { roles: "admin" },
    { roles: { admin: true } },
    { role: "administrator" },
  ])("rejects insufficient or malformed claims %j", (claims) => {
    expect(() => requireRole(request(claims), "admin")).toThrow(
      expect.objectContaining({ code: "permission-denied" }),
    );
  });
});
