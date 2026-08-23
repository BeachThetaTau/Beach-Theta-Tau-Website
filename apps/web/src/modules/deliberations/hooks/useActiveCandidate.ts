import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { subscribeActiveCandidateId } from "../api/deliberations.repository";
import { activeCandidateIdAtom } from "../atoms/deliberations.atoms";

export function useActiveCandidate() {
  const [candidateId, setCandidateId] = useAtom(activeCandidateIdAtom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeActiveCandidateId(
        (nextId) => {
          setCandidateId(nextId);
          setLoading(false);
        },
        (nextError) => {
          setError(nextError.message);
          setLoading(false);
        },
      ),
    [setCandidateId],
  );

  return { candidateId, loading, error };
}

