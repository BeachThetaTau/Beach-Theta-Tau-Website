import { FieldValue } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { adminDb } from "../shared/firebase-admin.js";
import { logger } from "../shared/logger.js";

export const archiveGraduates = onSchedule("0 3 1 7 *", async () => {
  const currentYear = new Date().getUTCFullYear();
  const snapshot = await adminDb.collection("users").get();
  let batch = adminDb.batch();
  let operations = 0;
  let archived = 0;

  for (const memberDocument of snapshot.docs) {
    const graduationYear = Number(memberDocument.data().gradYear);
    if (!Number.isFinite(graduationYear) || graduationYear >= currentYear) continue;

    const destination = adminDb.doc(`Alumni/${memberDocument.id}`);
    batch.set(destination, {
      ...memberDocument.data(),
      archivedAt: FieldValue.serverTimestamp(),
    });
    batch.delete(memberDocument.ref);
    operations += 2;
    archived += 1;

    if (operations >= 450) {
      await batch.commit();
      batch = adminDb.batch();
      operations = 0;
    }
  }

  if (operations) await batch.commit();
  logger.info("Archived graduates", { archived, currentYear });
});
