/**
 * Extracts a Google Drive file ID from a URL (e.g. drive.google.com/file/d/XYZ, id=XYZ) or returns the raw ID.
 */
export function extractDriveId(value?: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();

  // Pattern 1: /d/<id> or /file/d/<id>
  const directMatch = trimmed.match(/\/d\/([^/?#]+)/);
  if (directMatch?.[1]) return directMatch[1];

  // Pattern 2: ?id=<id> query parameter
  try {
    const url = new URL(trimmed);
    const queryId = url.searchParams.get("id");
    if (queryId) return queryId.trim();
  } catch {
    // Not a valid URL, check if it's already a plain file ID string
  }

  // If contains no slashes or spaces, likely a plain ID
  if (/^[\w-]+$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Normalizes and validates an email address. Returns lowercase trimmed email or null if invalid.
 */
export function normalizeEmail(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed.includes("@") || !trimmed.includes(".")) return null;
  return trimmed;
}

/**
 * Trims and collapses multiple spaces into a single space.
 */
export function cleanString(value?: string | null): string {
  if (!value) return "";
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Standardizes event names by removing redundant whitespace and preserving semester-agnostic titles.
 */
export function cleanEventName(value?: string | null): string {
  if (!value) return "";
  return cleanString(value);
}

export interface OmitEmptyOptions {
  /** If true, empty arrays [] will be kept. If false (default), empty arrays are omitted. */
  preserveEmptyArrays?: boolean;
}

/**
 * Strips null, undefined, and empty string properties from an object.
 * Ensures that merging into the database does not overwrite existing valued fields with blanks.
 */
export function omitEmptyValues<T extends Record<string, unknown>>(
  obj: T,
  options: OmitEmptyOptions = {},
): Partial<T> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length === 0) continue;
      result[key] = trimmed;
      continue;
    }
    if (Array.isArray(value)) {
      if (value.length === 0 && !options.preserveEmptyArrays) continue;
      result[key] = value;
      continue;
    }
    result[key] = value;
  }

  return result as Partial<T>;
}
