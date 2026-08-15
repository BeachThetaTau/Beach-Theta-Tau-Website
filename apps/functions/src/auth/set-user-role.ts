import type { AppRole } from "@beach-theta-tau/contracts";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { adminAuth } from "../shared/firebase-admin.js";
import { requireRole } from "../shared/require-role.js";
import { requireNonEmptyString } from "../shared/validation.js";

const APP_ROLES = ["member", "admin"] as const satisfies readonly AppRole[];

interface SetUserRoleInput {
  uid: string;
  role: AppRole;
}

export const setUserRole = onCall<SetUserRoleInput>(async (request) => {
  requireRole(request, "admin");
  const uid = requireNonEmptyString(request.data.uid, "uid");
  const role = request.data.role;
  if (!APP_ROLES.includes(role)) throw new HttpsError("invalid-argument", "Unsupported role.");

  const user = await adminAuth.getUser(uid);
  const currentClaims = user.customClaims ?? {};
  const roles = new Set<AppRole>(
    Array.isArray(currentClaims.roles)
      ? currentClaims.roles.filter((value): value is AppRole =>
          APP_ROLES.includes(value as AppRole),
        )
      : [],
  );
  roles.add(role);
  await adminAuth.setCustomUserClaims(uid, { ...currentClaims, roles: [...roles], role });
  return { uid, roles: [...roles] };
});
