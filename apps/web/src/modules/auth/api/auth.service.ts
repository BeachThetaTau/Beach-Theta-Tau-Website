import type { Account, AppRole, RoleClaims } from "@beach-theta-tau/contracts";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getIdTokenResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "@/shared/lib/firebase/auth";

const APP_ROLES = ["member", "admin"] as const satisfies readonly AppRole[];

function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
}

async function accountFromUser(user: User): Promise<Account> {
  const roles = new Set<AppRole>(["member"]);

  try {
    const token = await getIdTokenResult(user);
    const claims = token.claims as RoleClaims;
    if (isAppRole(claims.role)) roles.add(claims.role);
    if (Array.isArray(claims.roles)) {
      claims.roles.filter(isAppRole).forEach((role) => roles.add(role));
    }
  } catch (error) {
    console.warn("Unable to read role claims; continuing with member access.", error);
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    roles: [...roles],
  };
}

export function subscribeToAccount(
  onChange: (account: Account | null) => void,
  onError: (error: Error) => void,
) {
  return onAuthStateChanged(
    auth,
    (user) => {
      if (!user) {
        onChange(null);
        return;
      }
      void accountFromUser(user).then(onChange).catch(onError);
    },
    onError,
  );
}

export async function login(email: string, password: string, stayLoggedIn: boolean) {
  await setPersistence(auth, stayLoggedIn ? browserLocalPersistence : browserSessionPersistence);
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signup(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Triggers Firebase's built-in password-reset flow: Firebase emails the user a
 * secure reset link and hosts the page where they choose a new password. The
 * email template is configured in Firebase Console → Authentication → Templates.
 */
export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function logout() {
  await firebaseSignOut(auth);
}
