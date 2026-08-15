import type { CastVoteRequest, VoteChoice } from "@beach-theta-tau/contracts";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { adminDb } from "../shared/firebase-admin.js";
import { requireAuthenticated } from "../shared/require-role.js";
import { requireNonEmptyString } from "../shared/validation.js";

const VOTE_CHOICES = ["yes", "abstain", "no"] as const satisfies readonly VoteChoice[];

export const castVote = onCall<CastVoteRequest>(async (request) => {
  const auth = requireAuthenticated(request);
  const candidateId = requireNonEmptyString(request.data.candidateId, "candidateId");
  const vote = request.data.vote;
  if (vote !== null && !VOTE_CHOICES.includes(vote as VoteChoice)) {
    throw new HttpsError("invalid-argument", "Unsupported vote choice.");
  }

  await adminDb.runTransaction(async (transaction) => {
    const userRef = adminDb.doc(`users/${auth.uid}`);
    const activeRef = adminDb.doc("selectedDelib/current");
    const [userSnapshot, activeSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(activeRef),
    ]);

    // Only approved (verified) members may vote.
    if (userSnapshot.data()?.verified !== true) {
      throw new HttpsError("permission-denied", "Only verified members can vote.");
    }

    // Voting is only open for the candidate the admin has made active.
    const activeCandidateId = String(activeSnapshot.data()?.selectedDelib ?? "");
    if (!activeCandidateId) {
      throw new HttpsError("failed-precondition", "Voting is not currently open.");
    }
    if (candidateId !== activeCandidateId) {
      throw new HttpsError("failed-precondition", "You can only vote on the active candidate.");
    }

    const votes = {
      ...((userSnapshot.data()?.votes as Record<string, VoteChoice> | undefined) ?? {}),
    };
    if (vote) votes[candidateId] = vote;
    else delete votes[candidateId];
    transaction.set(userRef, { votes }, { merge: true });
  });

  return { candidateId, vote };
});
