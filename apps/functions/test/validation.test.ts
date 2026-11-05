import { describe, expect, it } from "vitest";
import { requireBoolean, requireNonEmptyString } from "../src/shared/validation";

describe("callable input validation", () => {
  it("trims valid strings", () => {
    expect(requireNonEmptyString(" candidate-1 ", "candidateId")).toBe("candidate-1");
  });
  it.each([undefined, null, 0, false, {}, [], "", "  "])("rejects invalid strings %j", (value) => {
    expect(() => requireNonEmptyString(value, "candidateId")).toThrow(
      expect.objectContaining({ code: "invalid-argument", message: "candidateId is required." }),
    );
  });
  it.each([true, false])("preserves boolean %s", (value) => {
    expect(requireBoolean(value, "active")).toBe(value);
  });
  it.each([undefined, null, 0, 1, "true", "false", {}])(
    "rejects boolean coercion for %j",
    (value) => {
      expect(() => requireBoolean(value, "active")).toThrow(
        expect.objectContaining({ code: "invalid-argument", message: "active must be a boolean." }),
      );
    },
  );
});
