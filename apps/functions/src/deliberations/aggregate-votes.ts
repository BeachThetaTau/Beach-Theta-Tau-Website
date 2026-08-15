import type { VoteChoice, VoteTotals } from "@beach-theta-tau/contracts";
import { onCall } from "firebase-functions/v2/https";
import { adminDb } from "../shared/firebase-admin.js";
import { requireRole } from "../shared/require-role.js";
import { requireNonEmptyString } from "../shared/validation.js";

interface AggregateVotesInput {
  candidateId: string;
}

export const aggregateVotes = onCall<AggregateVotesInput>(async (request): Promise<VoteTotals> => {
  requireRole(request, "admin");
  const candidateId = requireNonEmptyString(request.data.candidateId, "candidateId");
  const snapshot = await adminDb.collection("users").get();
  const counts = { yes: 0, no: 0, abstain: 0, total: 0 };

  for (const memberDocument of snapshot.docs) {
    const vote = memberDocument.data().votes?.[candidateId] as VoteChoice | undefined;
    if (vote === "yes" || vote === "no" || vote === "abstain") {
      counts[vote] += 1;
      counts.total += 1;
    }
  }

  const percent = (value: number) => (counts.total ? Math.round((value / counts.total) * 100) : 0);
  return {
    ...counts,
    yesPercent: percent(counts.yes),
    noPercent: percent(counts.no),
    abstainPercent: percent(counts.abstain),
  };
});
