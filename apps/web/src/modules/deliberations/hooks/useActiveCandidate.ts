import { useEffect, useState } from "react";
import { subscribeActiveCandidateId } from "../api/deliberations.repository";

export function useActiveCandidate() {
  const [candidateId, setCandidateId] = useState<string | null>(null);
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
    [],
  );

  return { candidateId, loading, error };
}
