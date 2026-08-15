import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const adminApp = getApps()[0] ?? initializeApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
