import type { DeliberationCandidate, VoteChoice } from "@beach-theta-tau/contracts";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/modules/auth";
import { castVote, listCandidates, subscribeMemberVotes } from "../api/deliberations.repository";
import { useActiveCandidate } from "./useActiveCandidate";

export function useBallot() {
  const { account } = useAuth();
  const active = useActiveCandidate();
  const [candidates, setCandidates] = useState<DeliberationCandidate[]>([]);
  const [votes, setVotes] = useState<Record<string, VoteChoice>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeRequest = true;
    void listCandidates()
      .then((nextCandidates) => {
        if (activeRequest) setCandidates(nextCandidates);
      })
      .catch((nextError) => {
        if (activeRequest) setError(nextError.message);
      })
      .finally(() => {
        if (activeRequest) setLoading(false);
      });
    return () => {
      activeRequest = false;
    };
  }, []);

  useEffect(() => {
    if (!account) return;
    return subscribeMemberVotes(account.uid, setVotes, (nextError) => setError(nextError.message));
  }, [account]);

  const candidate = useMemo(
    () => candidates.find((item) => item.id === active.candidateId) ?? null,
    [active.candidateId, candidates],
  );
  const currentVote = active.candidateId ? (votes[active.candidateId] ?? null) : null;

  const vote = async (choice: VoteChoice) => {
    if (!account || !active.candidateId) return;
    const candidateId = active.candidateId;
    const previousVote = currentVote;
    const nextVote = previousVote === choice ? null : choice;
    setError(null);
    setVotes((current) => {
      const next = { ...current };
      if (nextVote) next[candidateId] = nextVote;
      else delete next[candidateId];
      return next;
    });
    setSaving(true);
    try {
      await castVote(candidateId, nextVote);
    } catch (nextError) {
      setVotes((current) => {
        const next = { ...current };
        if (previousVote) next[candidateId] = previousVote;
        else delete next[candidateId];
        return next;
      });
      setError(nextError instanceof Error ? nextError.message : "Unable to save your vote.");
    } finally {
      setSaving(false);
    }
  };

  return {
    candidate,
    currentVote,
    vote,
    saving,
    loading: loading || active.loading,
    error: error ?? active.error,
    activeCandidateId: active.candidateId,
  };
}
