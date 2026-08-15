import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || "demo-project";
const app =
  getApps()[0] ??
  initializeApp({
    credential: applicationDefault(),
    projectId,
  });

export const adminDb = getFirestore(app);
