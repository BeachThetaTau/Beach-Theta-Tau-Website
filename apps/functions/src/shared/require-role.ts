import type { AppRole } from "@beach-theta-tau/contracts";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

export type AuthData = NonNullable<CallableRequest<unknown>["auth"]>;

export function requireAuthenticated(request: CallableRequest<unknown>): AuthData {
  if (!request.auth) throw new HttpsError("unauthenticated", "Authentication is required.");
  return request.auth;
}

export function requireRole(request: CallableRequest<unknown>, role: AppRole): AuthData {
  const auth = requireAuthenticated(request);
  const primaryRole = auth.token.role;
  const roles = Array.isArray(auth.token.roles) ? auth.token.roles : [];
  if (primaryRole !== role && !roles.includes(role)) {
    throw new HttpsError("permission-denied", `${role} access is required.`);
  }
  return auth;
}
