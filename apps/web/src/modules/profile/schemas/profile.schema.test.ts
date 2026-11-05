import { describe, expect, it } from "vitest";
import { normalizeProfile, validateProfile } from "./profile.schema";

describe("profile normalization", () => {
  it("trims fields and standardizes class and engineering names without mutating the input", () => {
    const input = Object.freeze({
      name: " Alex Smith ",
      class: " alpha   beta CLASS ",
      major: " mechanical ENGINEER ",
      gradYear: " 2027 ",
      linkedIn: " https://example.com/alex ",
    });
    expect(normalizeProfile(input)).toEqual({
      name: "Alex Smith",
      class: "Alpha Beta",
      major: "Mechanical Engineering",
      gradYear: "2027",
      linkedIn: "https://example.com/alex",
    });
    expect(input.name).toBe(" Alex Smith ");
  });
  it("supports absent optional fields and is idempotent", () => {
    const profile = { name: "Alex", class: "Alpha", major: undefined };
    expect(normalizeProfile(profile)).toEqual(profile);
    expect(normalizeProfile(normalizeProfile(profile))).toEqual(profile);
  });
});

describe("profile validation", () => {
  it("allows blank optional fields", () => {
    expect(
      validateProfile({ name: "Alex", class: "", gradYear: "", linkedIn: "", resumeLink: "" }),
    ).toEqual([]);
  });
  it("reports independent errors together", () => {
    expect(
      validateProfile({
        name: " ",
        class: "Alpha",
        gradYear: "27",
        linkedIn: "http://example.com",
        resumeLink: "javascript:alert(1)",
      }),
    ).toEqual([
      "Name is required.",
      "Graduation year must be a four-digit year.",
      "LinkedIn link must be a valid HTTPS URL.",
      "Resume link must be a valid HTTPS URL.",
    ]);
  });
  it.each(["202", "20277", "20a7", "2027 "])("rejects malformed year %s", (gradYear) => {
    expect(validateProfile({ name: "Alex", class: "Alpha", gradYear })).toContain(
      "Graduation year must be a four-digit year.",
    );
  });
  it("accepts a four-digit year and HTTPS links", () => {
    expect(
      validateProfile({
        name: "Alex",
        class: "Alpha",
        gradYear: "2027",
        linkedIn: "https://linkedin.com/in/alex",
        resumeLink: "https://example.com/resume.pdf",
      }),
    ).toEqual([]);
  });
});
