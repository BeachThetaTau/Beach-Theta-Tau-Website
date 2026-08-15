import { FieldValue } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";
import { adminDb } from "../shared/firebase-admin.js";
import { requireRole } from "../shared/require-role.js";
import { requireNonEmptyString } from "../shared/validation.js";

interface ApproveMemberInput {
  uid: string;
}

export const approveMember = onCall<ApproveMemberInput>(async (request) => {
  requireRole(request, "admin");
  const uid = requireNonEmptyString(request.data.uid, "uid");
  await adminDb.doc(`users/${uid}`).update({
    verified: true,
    copied: false,
    verifiedAt: FieldValue.serverTimestamp(),
  });
  return { uid, verified: true };
});
