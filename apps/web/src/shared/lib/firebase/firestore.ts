import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { env } from "../env";
import { firebaseApp } from "./client";

export const db = getFirestore(firebaseApp);

if (
  env.useFirebaseEmulators &&
  !(globalThis as { __bttFirestoreEmulator?: boolean }).__bttFirestoreEmulator
) {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  (globalThis as { __bttFirestoreEmulator?: boolean }).__bttFirestoreEmulator = true;
}
