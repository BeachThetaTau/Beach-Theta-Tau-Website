import type { MemberProfile } from "@beach-theta-tau/contracts";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/shared/lib/firebase/firestore";

/** Fields an admin may edit directly on a user document. */
export type AdminEditableUser = Pick<
  MemberProfile,
  | "name"
  | "email"
  | "class"
  | "gradYear"
  | "major"
  | "linkedIn"
  | "resumeLink"
  | "position"
  | "verified"
  | "copied"
>;

/**
 * Reads every user document. Admin-only: security rules allow admins to read
 * all users (verified and unverified). Sorted by name client-side — a Firestore
 * orderBy would silently drop docs missing the `name` field (e.g. new signups).
 */
export async function listAllUsers(): Promise<MemberProfile[]> {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs
    .map((userDocument) => ({
      ...(userDocument.data() as Omit<MemberProfile, "uid">),
      uid: userDocument.id,
    }))
    .sort((left, right) => (left.name ?? "").localeCompare(right.name ?? ""));
}

/**
 * Updates editable fields on a user document. Direct client write — permitted
 * because firestore.rules `isAdmin()` may update any field on user docs.
 */
export async function adminUpdateUser(uid: string, data: AdminEditableUser): Promise<void> {
  await updateDoc(doc(db, "users", uid), { ...data });
}

/**
 * Clears a user's ballot. Votes may only ever be wiped from the admin panel,
 * never edited entry-by-entry.
 */
export async function wipeUserVotes(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { votes: {} });
}
