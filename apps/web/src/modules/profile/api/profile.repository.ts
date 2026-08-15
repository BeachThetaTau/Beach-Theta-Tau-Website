import type { EditableMemberProfile, MemberProfile } from "@beach-theta-tau/contracts";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/shared/lib/firebase/firestore";

export function defaultProfile(email: string | null): MemberProfile {
  return {
    name: "",
    major: "",
    class: "",
    gradYear: "",
    linkedIn: "",
    resumeLink: "",
    email: email ?? "",
    verified: false,
    copied: false,
  };
}

export async function getOrCreateProfile(
  uid: string,
  email: string | null,
): Promise<MemberProfile> {
  const reference = doc(db, "users", uid);
  const snapshot = await getDoc(reference);
  if (snapshot.exists()) return { ...(snapshot.data() as MemberProfile), uid };

  const profile = defaultProfile(email);
  await setDoc(reference, profile, { merge: true });
  return { uid, ...profile };
}

export async function updateProfile(
  uid: string,
  email: string | null,
  data: EditableMemberProfile,
): Promise<MemberProfile> {
  const persisted: Omit<MemberProfile, "uid"> = {
    ...data,
    email: email ?? "",
    verified: false,
    copied: false,
  };
  await updateDoc(doc(db, "users", uid), persisted);
  return { uid, ...persisted };
}
