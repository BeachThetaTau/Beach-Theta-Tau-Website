import * as functions from "firebase-functions/v1";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../shared/firebase-admin.js";

export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  await adminDb.doc(`users/${user.uid}`).set(
    {
      name: user.displayName ?? "",
      email: user.email ?? "",
      major: "",
      class: "",
      gradYear: "",
      linkedIn: "",
      resumeLink: "",
      verified: false,
      copied: false,
      roles: ["member"],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
});
