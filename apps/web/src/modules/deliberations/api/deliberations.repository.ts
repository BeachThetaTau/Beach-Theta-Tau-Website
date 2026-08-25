import type { DeliberationCandidate, VoteChoice, VoteTotals } from "@beach-theta-tau/contracts";
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db } from "@/shared/lib/firebase/firestore";
import { functions } from "@/shared/lib/firebase/functions";

export async function listCandidates(): Promise<DeliberationCandidate[]> {
  const snapshot = await getDocs(collection(db, "delibs"));
  return snapshot.docs.map((candidateDocument) => ({
    ...(candidateDocument.data() as Omit<DeliberationCandidate, "id">),
    id: candidateDocument.id,
  }));
}

export function subscribeActiveCandidateId(
  onChange: (candidateId: string | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  let unsubscribeLegacy: Unsubscribe | null = null;
  const unsubscribeCurrent = onSnapshot(
    doc(db, "selectedDelib", "current"),
    (snapshot) => {
      if (snapshot.exists()) {
        unsubscribeLegacy?.();
        unsubscribeLegacy = null;
        onChange(String(snapshot.data()?.selectedDelib ?? "") || null);
        return;
      }

      if (!unsubscribeLegacy) {
        unsubscribeLegacy = onSnapshot(
          query(collection(db, "selectedDelib"), limit(1)),
          (legacySnapshot) =>
            onChange(String(legacySnapshot.docs[0]?.data().selectedDelib ?? "") || null),
          onError,
        );
      }
    },
    onError,
  );

  return () => {
    unsubscribeCurrent();
    unsubscribeLegacy?.();
  };
}

export async function setActiveCandidate(candidateId: string): Promise<void> {
  await setDoc(
    doc(db, "selectedDelib", "current"),
    { selectedDelib: candidateId },
    { merge: true },
  );
}

// --- Live deliberations session (global on/off switch) ---

/**
 * Subscribes to whether a deliberations session is currently live. Members use
 * this to decide whether to show their "Cast your vote" button; admins use it
 * to toggle the Start/Stop control.
 */
export function subscribeDelibsSession(
  onChange: (active: boolean) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, "delibsSession", "current"),
    (snapshot) => onChange(snapshot.data()?.active === true),
    onError,
  );
}

// Admin-only (enforced by firestore.rules `isAdmin()`): flip the live session on/off.
export async function setDelibsSessionActive(active: boolean): Promise<void> {
  await setDoc(
    doc(db, "delibsSession", "current"),
    { active, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export function subscribeMemberVotes(
  uid: string,
  onChange: (votes: Record<string, VoteChoice>) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, "users", uid),
    (snapshot) => {
      const votes = snapshot.data()?.votes;
      onChange(votes && typeof votes === "object" ? (votes as Record<string, VoteChoice>) : {});
    },
    onError,
  );
}

const castVoteCallable = httpsCallable<
  { candidateId: string; vote: VoteChoice | null },
  { candidateId: string; vote: VoteChoice | null }
>(functions, "castVote");

// Votes are written server-side by the castVote Cloud Function, which enforces
// that the caller is a verified member and that the candidate is the active one.
// Direct client writes to users/{uid}.votes are blocked by Firestore rules.
export async function castVote(candidateId: string, vote: VoteChoice | null): Promise<void> {
  await castVoteCallable({ candidateId, vote });
}

export function subscribeVoteTotals(
  candidateId: string,
  onChange: (totals: VoteTotals) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      const counts = { yes: 0, no: 0, abstain: 0, total: 0 };
      for (const memberDocument of snapshot.docs) {
        const value = String(memberDocument.data().votes?.[candidateId] ?? "").toLowerCase();
        if (value === "yes" || value === "no" || value === "abstain") {
          counts[value] += 1;
          counts.total += 1;
        }
      }
      const percent = (value: number) =>
        counts.total ? Math.round((value / counts.total) * 100) : 0;
      onChange({
        ...counts,
        yesPercent: percent(counts.yes),
        noPercent: percent(counts.no),
        abstainPercent: percent(counts.abstain),
      });
    },
    onError,
  );
}

export async function setCandidateBidStatus(candidateId: string, bidReceived: boolean) {
  await updateDoc(doc(db, "delibs", candidateId), { bidReceived });
}

function csvField(value: string) {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function candidatesToCsv(candidates: DeliberationCandidate[]): string {
  const rows = [...candidates]
    .sort((left, right) => {
      if (left.bidReceived !== right.bidReceived) return left.bidReceived ? -1 : 1;
      return left.name.localeCompare(right.name);
    })
    .map((candidate) => [
      candidate.name || "Unknown",
      candidate.id,
      candidate.bidReceived ? "Yes" : "No",
    ]);

  return [["Name", "Email", "Bid Received"], ...rows]
    .map((row) => row.map((value) => csvField(String(value))).join(","))
    .join("\n");
}

/**
 * Deletes all deliberation candidates from the `delibs` collection,
 * wipes all cast votes across all user profiles, and resets `selectedDelib` and `delibsSession`.
 */
export async function clearAllDeliberationsData(): Promise<{
  deletedCandidatesCount: number;
  clearedUsersCount: number;
}> {
  const [candidatesSnapshot, usersSnapshot, selectedSnapshot] = await Promise.all([
    getDocs(collection(db, "delibs")),
    getDocs(collection(db, "users")),
    getDocs(collection(db, "selectedDelib")),
  ]);

  let batch = writeBatch(db);
  let operations = 0;

  const commitIfNeeded = async () => {
    if (operations >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      operations = 0;
    }
  };

  // Delete all candidate documents in delibs
  for (const candidateDoc of candidatesSnapshot.docs) {
    batch.delete(candidateDoc.ref);
    operations += 1;
    await commitIfNeeded();
  }

  // Wipe votes on all users who have votes recorded
  let clearedUsersCount = 0;
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    if (
      userData.votes &&
      typeof userData.votes === "object" &&
      Object.keys(userData.votes as object).length > 0
    ) {
      batch.update(userDoc.ref, { votes: {} });
      clearedUsersCount += 1;
      operations += 1;
      await commitIfNeeded();
    }
  }

  // Delete all selectedDelib documents
  for (const selDoc of selectedSnapshot.docs) {
    batch.delete(selDoc.ref);
    operations += 1;
    await commitIfNeeded();
  }

  // Set delibs session to inactive
  batch.set(
    doc(db, "delibsSession", "current"),
    { active: false, updatedAt: serverTimestamp() },
    { merge: true },
  );
  operations += 1;

  if (operations > 0) {
    await batch.commit();
  }

  return {
    deletedCandidatesCount: candidatesSnapshot.docs.length,
    clearedUsersCount,
  };
}

