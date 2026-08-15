import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { adminDb } from "./_firebase-admin.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const photoDirectory = path.join(root, "apps/web/src/shared/assets/members/Brothers");
const files = new Set((await readdir(photoDirectory)).filter((file) => file.endsWith(".webp")));
const snapshot = await adminDb.collection("users").where("verified", "==", true).get();
const expected = new Set(
  snapshot.docs.map(
    (document) =>
      `${String(document.data().name ?? "")
        .replace(/[^a-zA-Z]/g, "")
        .toLowerCase()}.webp`,
  ),
);

const missing = [...expected].filter((file) => !files.has(file));
const orphaned = [...files].filter((file) => !expected.has(file) && !file.startsWith("blank"));
console.log(JSON.stringify({ missing, orphaned }, null, 2));
if (missing.length) process.exitCode = 1;
