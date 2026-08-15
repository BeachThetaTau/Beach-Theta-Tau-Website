import { connectStorageEmulator, getStorage } from "firebase/storage";
import { env } from "../env";
import { firebaseApp } from "./client";

export const storage = getStorage(firebaseApp);

if (
  env.useFirebaseEmulators &&
  !(globalThis as { __bttStorageEmulator?: boolean }).__bttStorageEmulator
) {
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  (globalThis as { __bttStorageEmulator?: boolean }).__bttStorageEmulator = true;
}
