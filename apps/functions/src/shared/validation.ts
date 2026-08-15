import { HttpsError } from "firebase-functions/v2/https";

export function requireNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpsError("invalid-argument", `${fieldName} is required.`);
  }
  return value.trim();
}

export function requireBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== "boolean") {
    throw new HttpsError("invalid-argument", `${fieldName} must be a boolean.`);
  }
  return value;
}
