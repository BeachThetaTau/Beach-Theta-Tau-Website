import type { MemberProfile } from "@beach-theta-tau/contracts";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
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
 * Reads every graduate/alumni document from the Alumni collection.
 */
export async function listAllAlumni(): Promise<MemberProfile[]> {
  const snapshot = await getDocs(collection(db, "Alumni"));
  return snapshot.docs
    .map((gradDoc) => ({
      ...(gradDoc.data() as Omit<MemberProfile, "uid">),
      uid: gradDoc.id,
    }))
    .sort((left, right) => (left.name ?? "").localeCompare(right.name ?? ""));
}

export const listAllGraduates = listAllAlumni;

/**
 * Updates editable fields on a user document. Direct client write — permitted
 * because firestore.rules `isAdmin()` may update any field on user docs.
 */
export async function adminUpdateUser(
  uid: string,
  data: Partial<AdminEditableUser>,
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { ...data });
}


/**
 * Sets or clears a user's chapter position.
 */
export async function adminSetUserPosition(uid: string, position: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { position: position.trim() });
}

/**
 * Permanently deletes a user document from the users collection.
 */
export async function adminDeleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid));
}

/**
 * Moves a member from the `users` collection to the `Alumni` collection.
 * Cleans up votes and transient flags, sets a graduatedAt timestamp, and
 * deletes the active member document atomically.
 */
export async function adminGraduateUser(
  uid: string,
  fallbackProfile?: Partial<MemberProfile>,
): Promise<void> {
  let profileData: Record<string, unknown> = fallbackProfile ? { ...fallbackProfile } : {};

  // If fallback profile isn't complete, fetch the latest document
  if (!fallbackProfile?.name) {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      profileData = userDoc.data() as Record<string, unknown>;
    }
  }

  // Remove transient active-member fields like votes and copied
  delete profileData.votes;
  delete profileData.copied;
  delete profileData.uid;

  const alumniPayload = {
    ...profileData,
    name: (profileData.name as string | undefined)?.trim() ?? "",
    email: (profileData.email as string | undefined)?.trim() ?? "",
    class: (profileData.class as string | undefined)?.trim() ?? "",
    gradYear: (profileData.gradYear as string | undefined)?.trim() ?? "",
    major: (profileData.major as string | undefined)?.trim() ?? "",
    linkedIn: (profileData.linkedIn as string | undefined)?.trim() ?? "",
    resumeLink: (profileData.resumeLink as string | undefined)?.trim() ?? "",
    position: (profileData.position as string | undefined)?.trim() ?? "",
    verified: profileData.verified ?? true,
    graduatedAt: serverTimestamp(),
  };

  const batch = writeBatch(db);
  batch.set(doc(db, "Alumni", uid), alumniPayload, { merge: true });
  batch.delete(doc(db, "users", uid));
  await batch.commit();
}

/**
 * Permanently deletes a record from the Alumni collection.
 */
export async function adminDeleteAlumni(uid: string): Promise<void> {
  await deleteDoc(doc(db, "Alumni", uid));
}

export const adminDeleteGraduate = adminDeleteAlumni;

/**
 * Moves an alumni graduate back to the active users collection.
 */
export async function adminRestoreAlumni(
  uid: string,
  fallbackProfile?: Partial<MemberProfile>,
): Promise<void> {
  let profileData: Record<string, unknown> = fallbackProfile ? { ...fallbackProfile } : {};
  if (!fallbackProfile?.name) {
    const alumniDoc = await getDoc(doc(db, "Alumni", uid));
    if (alumniDoc.exists()) {
      profileData = alumniDoc.data() as Record<string, unknown>;
    }
  }

  delete profileData.graduatedAt;
  delete profileData.uid;

  const userPayload = {
    ...profileData,
    verified: true,
    copied: false,
    votes: {},
  };

  const batch = writeBatch(db);
  batch.set(doc(db, "users", uid), userPayload, { merge: true });
  batch.delete(doc(db, "Alumni", uid));
  await batch.commit();
}

export const adminRestoreGraduate = adminRestoreAlumni;

/**
 * Clears a user's ballot. Votes may only ever be wiped from the admin panel,
 * never edited entry-by-entry.
 */
export async function wipeUserVotes(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { votes: {} });
}

