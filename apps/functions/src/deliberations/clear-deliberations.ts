import { onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../shared/firebase-admin.js";
import { requireRole } from "../shared/require-role.js";

export const clearDeliberations = onCall(async (request) => {
  requireRole(request, "admin");

  const [candidatesSnapshot, usersSnapshot, selectedSnapshot] = await Promise.all([
    adminDb.collection("delibs").get(),
    adminDb.collection("users").get(),
    adminDb.collection("selectedDelib").get(),
  ]);

  let batch = adminDb.batch();
  let operations = 0;

  const commitIfNeeded = async () => {
    if (operations >= 400) {
      await batch.commit();
      batch = adminDb.batch();
      operations = 0;
    }
  };

  // Delete all candidates from delibs collection
  for (const candidateDoc of candidatesSnapshot.docs) {
    batch.delete(candidateDoc.ref);
    operations += 1;
    await commitIfNeeded();
  }

  // Wipe votes for all users who have votes recorded
  let clearedUsersCount = 0;
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    if (
      userData.votes &&
      typeof userData.votes === "object" &&
      Object.keys(userData.votes as object).length > 0
    ) {
      batch.update(userDoc.ref, { votes: {} });
      clearedUsersCount += 1;
      operations += 1;
      await commitIfNeeded();
    }
  }

  // Delete all selectedDelib documents
  for (const selDoc of selectedSnapshot.docs) {
    batch.delete(selDoc.ref);
    operations += 1;
    await commitIfNeeded();
  }

  // Reset delibsSession to inactive
  batch.set(
    adminDb.doc("delibsSession/current"),
    { active: false, updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
  operations += 1;

  if (operations > 0) {
    await batch.commit();
  }

  return {
    deletedCandidates: candidatesSnapshot.docs.length,
    clearedUsers: clearedUsersCount,
  };
});
