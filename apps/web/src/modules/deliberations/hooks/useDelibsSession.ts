import { useEffect, useState } from "react";
import { subscribeDelibsSession } from "../api/deliberations.repository";

/** Live status of the global deliberations session (admin-controlled). */
export function useDelibsSession() {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeDelibsSession(
        (nextActive) => {
          setActive(nextActive);
          setLoading(false);
        },
        (nextError) => {
          setError(nextError.message);
          setLoading(false);
        },
      ),
    [],
  );

  return { active, loading, error };
}

export default useDelibsSession;
