import { adminDb } from "./_firebase-admin.js";

const apply = process.argv.includes("--apply");
const cutoffArg = process.argv.find((argument) => argument.startsWith("--before-year="));
const cutoffYear = Number(cutoffArg?.split("=")[1] ?? new Date().getUTCFullYear());

if (!Number.isFinite(cutoffYear)) throw new Error("--before-year must be a number.");

const snapshot = await adminDb.collection("users").get();
const candidates = snapshot.docs.filter((document) => {
  const graduationYear = Number(document.data().gradYear);
  return Number.isFinite(graduationYear) && graduationYear < cutoffYear;
});

console.log(
  `${apply ? "Migrating" : "Would migrate"} ${candidates.length} users graduating before ${cutoffYear}.`,
);

if (apply) {
  let batch = adminDb.batch();
  let operations = 0;
  for (const document of candidates) {
    const profile = { ...document.data() };
    delete profile.copied;
    delete profile.verified;
    batch.set(adminDb.doc(`Alumni/${document.id}`), profile, { merge: true });
    batch.delete(document.ref);
    operations += 2;
    if (operations >= 450) {
      await batch.commit();
      batch = adminDb.batch();
      operations = 0;
    }
  }
  if (operations) await batch.commit();
  console.log("Migration complete.");
} else {
  console.log("Dry run only. Re-run with --apply to write changes.");
}
