import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { toErrorMessage } from "@/shared/lib/errors";
import { getVerifiedMembers } from "../api/members.repository";
import { allMembersAtom } from "../atoms/members.atoms";

export function useMembers() {
  const [members, setMembers] = useAtom(allMembersAtom);
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
  }, [setMembers]);

  return { members, loading, error };
}

