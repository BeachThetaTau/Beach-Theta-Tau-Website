import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
process.env.GCLOUD_PROJECT ||= "demo-project";

const { adminDb } = await import("./_firebase-admin.js");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const members = JSON.parse(
  await readFile(path.join(root, "firebase/seed/members.json"), "utf8"),
) as Array<Record<string, unknown> & { uid: string }>;
const retreat = JSON.parse(
  await readFile(path.join(root, "firebase/seed/retreat.json"), "utf8"),
) as Array<Record<string, unknown> & { id: string }>;

const batch = adminDb.batch();
for (const { uid, ...profile } of members) batch.set(adminDb.doc(`users/${uid}`), profile);
for (const cell of retreat) batch.set(adminDb.doc(`Bingo/${cell.id}`), cell);
await batch.commit();
console.log(`Seeded ${members.length} members and ${retreat.length} bingo cells.`);
