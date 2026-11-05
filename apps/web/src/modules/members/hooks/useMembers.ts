import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { toErrorMessage } from "@/shared/lib/errors";
import { getVerifiedMembers, peekCachedMembers } from "../api/members.repository";
import { allMembersAtom } from "../atoms/members.atoms";

export function useMembers() {
  const [members, setMembers] = useAtom(allMembersAtom);
  const [cached] = useState(() => peekCachedMembers());
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getVerifiedMembers()
      .then((nextMembers) => {
        if (active) setMembers(nextMembers);
      })
      .catch((nextError) => {
        if (!active) return;
        // A failed refresh shouldn't wipe out a directory we can already show.
        if (cached) setMembers(cached.members);
        else if (members.length === 0) {
          setError(toErrorMessage(nextError, "Unable to load the member directory."));
        }
      })
      .finally(() => {
        if (active) setPending(false);
      });
    return () => {
      active = false;
    };
    // Intentionally run once per mount: members/cached only decide whether to surface errors.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setMembers]);

  const visible = members.length > 0 || !pending ? members : (cached?.members ?? []);

  return { members: visible, loading: pending && visible.length === 0, error };
}
