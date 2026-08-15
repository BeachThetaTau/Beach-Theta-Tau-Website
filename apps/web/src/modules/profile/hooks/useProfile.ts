import type { EditableMemberProfile, MemberProfile } from "@beach-theta-tau/contracts";
import { useEffect, useState } from "react";
import { useAuth } from "@/modules/auth";
import { toErrorMessage } from "@/shared/lib/errors";
import { getOrCreateProfile, updateProfile } from "../api/profile.repository";
import { normalizeProfile, validateProfile } from "../schemas/profile.schema";

const editableFromProfile = (profile: MemberProfile): EditableMemberProfile => ({
  name: profile.name ?? "",
  major: profile.major ?? "",
  class: profile.class ?? "",
  gradYear: profile.gradYear ?? "",
  linkedIn: profile.linkedIn ?? "",
  resumeLink: profile.resumeLink ?? "",
});

export function useProfile() {
  const { account } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [draft, setDraft] = useState<EditableMemberProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!account) return;
    let active = true;
    setLoading(true);
    void getOrCreateProfile(account.uid, account.email)
      .then((nextProfile) => {
        if (!active) return;
        setProfile(nextProfile);
        if (!nextProfile.name) {
          setDraft(editableFromProfile(nextProfile));
          setEditing(true);
        }
      })
      .catch((nextError) => {
        if (active) setError(toErrorMessage(nextError, "Unable to load your profile."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [account]);

  const beginEditing = () => {
    if (!profile) return;
    setDraft(editableFromProfile(profile));
    setValidationErrors([]);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(profile ? editableFromProfile(profile) : null);
    setValidationErrors([]);
    setEditing(false);
  };

  const updateField = (field: keyof EditableMemberProfile, value: string) => {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  };

  const save = async () => {
    if (!account || !draft) return false;
    const normalized = normalizeProfile(draft);
    const errors = validateProfile(normalized);
    setValidationErrors(errors);
    if (errors.length) return false;

    setSaving(true);
    try {
      const updated = await updateProfile(account.uid, account.email, normalized);
      setProfile(updated);
      setDraft(editableFromProfile(updated));
      setEditing(false);
      setError(null);
      return true;
    } catch (nextError) {
      setError(toErrorMessage(nextError, "Unable to save your profile."));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    draft,
    editing,
    loading,
    saving,
    error,
    validationErrors,
    beginEditing,
    cancelEditing,
    updateField,
    save,
  };
}
