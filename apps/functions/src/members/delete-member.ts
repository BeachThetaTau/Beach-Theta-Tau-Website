import { onCall } from "firebase-functions/v2/https";
import { adminDb } from "../shared/firebase-admin.js";
import { requireRole } from "../shared/require-role.js";
import { requireNonEmptyString } from "../shared/validation.js";

interface DeleteMemberInput {
  uid: string;
}

export const deleteMember = onCall<DeleteMemberInput>(async (request) => {
  requireRole(request, "admin");
  const uid = requireNonEmptyString(request.data.uid, "uid");

  await adminDb.doc(`users/${uid}`).delete();
  return { uid, deleted: true };
});
