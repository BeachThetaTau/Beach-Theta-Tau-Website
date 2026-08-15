import type { MemberProfile } from "@beach-theta-tau/contracts";
import { useEffect, useState } from "react";
import { toErrorMessage } from "@/shared/lib/errors";
import { getVerifiedMembers } from "../api/members.repository";

export function useMembers() {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getVerifiedMembers()
      .then((nextMembers) => {
        if (active) setMembers(nextMembers);
      })
      .catch((nextError) => {
        if (active) setError(toErrorMessage(nextError, "Unable to load the member directory."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { members, loading, error };
}
