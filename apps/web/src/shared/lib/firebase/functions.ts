import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { env } from "../env";
import { firebaseApp } from "./client";

export const functions = getFunctions(firebaseApp);

if (
  env.useFirebaseEmulators &&
  !(globalThis as { __bttFunctionsEmulator?: boolean }).__bttFunctionsEmulator
) {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  (globalThis as { __bttFunctionsEmulator?: boolean }).__bttFunctionsEmulator = true;
}
