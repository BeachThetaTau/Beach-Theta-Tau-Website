import type { MemberProfile } from "@beach-theta-tau/contracts";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/shared/lib/firebase/firestore";

export async function getVerifiedMembers(): Promise<MemberProfile[]> {
  const snapshot = await getDocs(query(collection(db, "users"), where("verified", "==", true)));
  return snapshot.docs.map((memberDocument) => ({
    ...(memberDocument.data() as Omit<MemberProfile, "uid">),
    uid: memberDocument.id,
  }));
}

export async function getMajorCounts(): Promise<Record<string, number>> {
  const snapshot = await getDocs(query(collection(db, "users"), where("verified", "==", true)));
  const counts: Record<string, number> = {};

  for (const memberDocument of snapshot.docs) {
    const major = memberDocument.data().major;
    if (typeof major === "string" && major.trim()) {
      counts[major] = (counts[major] ?? 0) + 1;
    }
  }

  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  );
}
