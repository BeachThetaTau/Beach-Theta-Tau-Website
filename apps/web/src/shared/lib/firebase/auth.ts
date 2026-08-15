import { connectAuthEmulator, getAuth } from "firebase/auth";
import { env } from "../env";
import { firebaseApp } from "./client";

export const auth = getAuth(firebaseApp);

if (
  env.useFirebaseEmulators &&
  !(globalThis as { __bttAuthEmulator?: boolean }).__bttAuthEmulator
) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  (globalThis as { __bttAuthEmulator?: boolean }).__bttAuthEmulator = true;
}
