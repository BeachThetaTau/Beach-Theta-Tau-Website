import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { subscribeDelibsSession } from "../api/deliberations.repository";
import { delibsSessionActiveAtom } from "../atoms/deliberations.atoms";

/** Live status of the global deliberations session (admin-controlled). */
export function useDelibsSession() {
  const [active, setActive] = useAtom(delibsSessionActiveAtom);
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
    [setActive],
  );

  return { active, loading, error };
}

export default useDelibsSession;

