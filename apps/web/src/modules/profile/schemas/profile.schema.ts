import type { EditableMemberProfile } from "@beach-theta-tau/contracts";
import { isHttpsUrl } from "@/shared/lib/urls";

export const profileFields: Array<keyof EditableMemberProfile> = [
  "name",
  "major",
  "class",
  "gradYear",
  "linkedIn",
  "resumeLink",
];

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function normalizeProfile(data: EditableMemberProfile): EditableMemberProfile {
  const normalized = Object.fromEntries(
    Object.entries(data).map(([key, rawValue]) => [
      key,
      typeof rawValue === "string" ? rawValue.trim() : rawValue,
    ]),
  ) as unknown as EditableMemberProfile;

  if (normalized.class.toLowerCase().endsWith(" class")) {
    normalized.class = normalized.class.slice(0, -" class".length).trim();
  }
  if (normalized.major?.toLowerCase().endsWith(" engineer")) {
    normalized.major = `${normalized.major.slice(0, -" engineer".length).trim()} engineering`;
  }

  normalized.class = titleCase(normalized.class);
  if (normalized.major) normalized.major = titleCase(normalized.major);
  return normalized;
}

export function validateProfile(data: EditableMemberProfile): string[] {
  const errors: string[] = [];
  if (!data.name.trim()) errors.push("Name is required.");
  if (data.gradYear && !/^\d{4}$/.test(data.gradYear)) {
    errors.push("Graduation year must be a four-digit year.");
  }
  if (data.linkedIn && !isHttpsUrl(data.linkedIn)) {
    errors.push("LinkedIn link must be a valid HTTPS URL.");
  }
  if (data.resumeLink && !isHttpsUrl(data.resumeLink)) {
    errors.push("Resume link must be a valid HTTPS URL.");
  }
  return errors;
}
