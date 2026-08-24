/**
 * Revoke the "admin" custom claim and Firestore admin flag for a user.
 *
 * Usage (from workspace root):
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 *   node apps/functions/scripts/revoke-admin.mjs <uid>
 *
 * To run against the local emulator instead:
 *   export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
 *   export FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
 *   node apps/functions/scripts/revoke-admin.mjs <uid>
 */
import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const APP_ROLES = ["member", "admin"];

const uid = process.argv[2];
if (!uid) {
  console.error("Usage: node apps/functions/scripts/revoke-admin.mjs <uid>");
  process.exit(1);
}

const usingEmulator = Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);
const app =
  getApps()[0] ?? initializeApp(usingEmulator ? {} : { credential: applicationDefault() });
const auth = getAuth(app);
const db = getFirestore(app);

const user = await auth.getUser(uid);
const current = user.customClaims ?? {};
const roles = new Set(
  Array.isArray(current.roles) ? current.roles.filter((r) => APP_ROLES.includes(r)) : ["member"],
);
roles.delete("admin");
roles.add("member");

await auth.setCustomUserClaims(uid, { ...current, roles: [...roles], role: "member" });

const userRef = db.doc(`users/${uid}`);
const userDoc = await userRef.get();
if (userDoc.exists) {
  await userRef.update({
    role: "member",
    isAdmin: false,
  });
}

console.log(
  `Revoked admin from ${uid} (${user.email ?? "no email"}). Roles: ${[...roles].join(", ")}`,
);
console.log(
  "The user must sign out and back in (or refresh their ID token) for the claim to take effect.",
);
process.exit(0);
