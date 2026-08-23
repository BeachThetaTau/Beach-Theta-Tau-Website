import { onCall } from "firebase-functions/v2/https";
import { adminDb } from "../shared/firebase-admin.js";
import { requireRole } from "../shared/require-role.js";
import { requireNonEmptyString } from "../shared/validation.js";

interface SetMemberPositionInput {
  uid: string;
  position: string;
}

export const setMemberPosition = onCall<SetMemberPositionInput>(async (request) => {
  requireRole(request, "admin");
  const uid = requireNonEmptyString(request.data.uid, "uid");
  const position = typeof request.data.position === "string" ? request.data.position.trim() : "";

  await adminDb.doc(`users/${uid}`).update({ position });
  return { uid, position };
});
