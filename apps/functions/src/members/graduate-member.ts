import { FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { adminDb } from "../shared/firebase-admin.js";
import { requireRole } from "../shared/require-role.js";
import { requireNonEmptyString } from "../shared/validation.js";

interface GraduateMemberInput {
  uid: string;
}

export const graduateMember = onCall<GraduateMemberInput>(async (request) => {
  requireRole(request, "admin");
  const uid = requireNonEmptyString(request.data.uid, "uid");

  const userRef = adminDb.doc(`users/${uid}`);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new HttpsError("not-found", `User document "${uid}" does not exist.`);
  }

  const profile = { ...userDoc.data() };
  delete profile.votes;
  delete profile.copied;

  const alumniRef = adminDb.doc(`Alumni/${uid}`);
  const batch = adminDb.batch();

  batch.set(
    alumniRef,
    {
      ...profile,
      graduatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  batch.delete(userRef);

  await batch.commit();
  return { uid, graduated: true };
});
