export const APP_ROLES = ["member", "admin"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export interface RoleClaims {
  role?: AppRole;
  roles?: AppRole[];
}

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
}
