import type { VoteTotals } from "@beach-theta-tau/contracts";
import { useEffect, useState } from "react";
import { subscribeVoteTotals } from "../api/deliberations.repository";

export function useVoteResults(candidateId: string | null) {
  const [totals, setTotals] = useState<VoteTotals | null>(null);
  const [loading, setLoading] = useState(Boolean(candidateId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (!candidateId) {
      setTotals(null);
      setLoading(false);
      return;
    }
    setTotals(null);
    setLoading(true);
    return subscribeVoteTotals(
      candidateId,
      (nextTotals) => {
        setTotals(nextTotals);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError.message);
        setLoading(false);
      },
    );
  }, [candidateId]);

  return { totals, loading, error };
}
