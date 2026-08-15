import type { MemberProfile } from "@beach-theta-tau/contracts";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  adminUpdateUser,
  listAllUsers,
  wipeUserVotes,
  type AdminEditableUser,
} from "../../api/admin-users.repository";
import { Button } from "@/shared/ui/Button/Button";
import { EmptyState } from "@/shared/ui/EmptyState/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState/LoadingState";
import { Modal } from "@/shared/ui/Modal/Modal";

type EditForm = {
  name: string;
  email: string;
  class: string;
  gradYear: string;
  major: string;
  linkedIn: string;
  resumeLink: string;
  position: string;
  verified: boolean;
  copied: boolean;
};

type FieldDef = { key: keyof EditForm; label: string; placeholder?: string };

const PROFILE_FIELDS: ReadonlyArray<FieldDef> = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "class", label: "Class" },
  { key: "gradYear", label: "Grad year" },
  { key: "major", label: "Major" },
  { key: "position", label: "Position" },
];

const LINK_FIELDS: ReadonlyArray<FieldDef> = [
  { key: "linkedIn", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/…" },
  { key: "resumeLink", label: "Résumé link", placeholder: "https://…" },
];

function toForm(member: MemberProfile): EditForm {
  return {
    name: member.name ?? "",
    email: member.email ?? "",
    class: member.class ?? "",
    gradYear: member.gradYear ?? "",
    major: member.major ?? "",
    linkedIn: member.linkedIn ?? "",
    resumeLink: member.resumeLink ?? "",
    position: member.position ?? "",
    verified: member.verified ?? false,
    copied: member.copied ?? false,
  };
}

function toPayload(form: EditForm): AdminEditableUser {
  return {
    name: form.name.trim(),
    email: form.email.trim(),
    class: form.class.trim(),
    gradYear: form.gradYear.trim(),
    major: form.major.trim(),
    linkedIn: form.linkedIn.trim(),
    resumeLink: form.resumeLink.trim(),
    position: form.position.trim(),
    verified: form.verified,
    copied: form.copied,
  };
}

function initials(name?: string, email?: string): string {
  const source = (name ?? "").trim() || (email ?? "").trim();
  if (!source) return "—";
  const parts = source.split(/\s+/).filter(Boolean);
  const first = parts[0];
  const second = parts[1];
  if (first && second && first[0] && second[0]) {
    return (first[0] + second[0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function AdminMembersPanel() {
  const [users, setUsers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<MemberProfile | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await listAllUsers();
        if (active) setUsers(list);
      } catch {
        if (active) setLoadError("Could not load users. Check your permissions and try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const verified = users.filter((user) => Boolean(user.verified)).length;
    const votes = users.reduce((sum, user) => sum + Object.keys(user.votes ?? {}).length, 0);
    return {
      total: users.length,
      verified,
      pending: users.length - verified,
      votes,
    };
  }, [users]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.name, user.email, user.major, user.position, user.class]
        .filter((value): value is string => typeof value === "string")
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [users, search]);

  function openEditor(member: MemberProfile) {
    setSelected(member);
    setForm(toForm(member));
    setModalError(null);
  }

  function closeEditor() {
    setSelected(null);
    setForm(null);
    setModalError(null);
  }

  function setField<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!selected?.uid || !form) return;
    setSaving(true);
    setModalError(null);
    try {
      const payload = toPayload(form);
      await adminUpdateUser(selected.uid, payload);
      setUsers((prev) =>
        prev.map((user) => (user.uid === selected.uid ? { ...user, ...payload } : user)),
      );
      closeEditor();
    } catch {
      setModalError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleWipeVotes() {
    if (!selected?.uid) return;
    const voteCount = Object.keys(selected.votes ?? {}).length;
    if (!window.confirm(`Wipe all ${voteCount} vote(s) cast by ${selected.name || "this user"}?`)) {
      return;
    }
    setWiping(true);
    setModalError(null);
    try {
      await wipeUserVotes(selected.uid);
      setUsers((prev) =>
        prev.map((user) => (user.uid === selected.uid ? { ...user, votes: {} } : user)),
      );
      setSelected((prev) => (prev ? { ...prev, votes: {} } : prev));
    } catch {
      setModalError("Could not wipe votes. Please try again.");
    } finally {
      setWiping(false);
    }
  }

  if (loading) return <LoadingState label="Loading members…" />;
  if (loadError) return <EmptyState title="Unable to load members" description={loadError} />;

  const voteCount = Object.keys(selected?.votes ?? {}).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Members" value={stats.total} tone="brand" icon={<IconPeople />} />
        <StatCard label="Verified" value={stats.verified} tone="green" icon={<IconCheck />} />
        <StatCard label="Pending" value={stats.pending} tone="gold" icon={<IconClock />} />
        <StatCard label="Votes cast" value={stats.votes} tone="maroon" icon={<IconBallot />} />
      </div>

      <section className="panel p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="subsection-title">Members</h2>
            <p className="mt-1 text-sm text-muted">
              {users.length} total · {filtered.length} shown
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-muted">
              <IconSearch />
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, major…"
              className="w-full rounded-full border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink shadow-sm outline-none transition-colors focus:border-maroon"
              aria-label="Search members"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-line bg-white/60 px-6 py-12 text-center">
            <p className="font-medium text-ink">No members match your search</p>
            <p className="mt-1 text-sm text-muted">Try a different name, email, or major.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-soft text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-semibold">Member</th>
                    <th className="px-4 py-3 font-semibold">Class</th>
                    <th className="px-4 py-3 font-semibold">Verified</th>
                    <th className="px-4 py-3 font-semibold">Copied</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr
                      key={user.uid}
                      className="border-b border-line/60 align-middle transition-colors last:border-b-0 hover:bg-surface-soft"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand"
                            aria-hidden="true"
                          >
                            {initials(user.name, user.email)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">
                              {user.name || "Unnamed member"}
                            </p>
                            <p className="truncate text-xs text-muted">
                              {user.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{user.class || "—"}</td>
                      <td className="px-4 py-3">
                        <StatusPill
                          on={Boolean(user.verified)}
                          onLabel="Verified"
                          offLabel="Pending"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill on={Boolean(user.copied)} onLabel="Copied" offLabel="No" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEditor(user)}
                          className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-maroon transition-colors hover:border-maroon hover:bg-maroon hover:text-white"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <Modal isOpen={Boolean(selected && form)} onClose={closeEditor} ariaLabel="Edit member">
        {form && selected && (
          <div className="w-[min(90vw,40rem)]">
            <div className="flex items-center gap-4 border-b border-line pb-5">
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand/10 text-sm font-bold text-brand"
                aria-hidden="true"
              >
                {initials(selected.name, selected.email)}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-xl font-bold text-ink">
                  {selected.name || "Edit member"}
                </h3>
                <p className="truncate text-xs text-muted">User ID: {selected.uid}</p>
              </div>
            </div>

            <FieldGroup title="Profile">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {PROFILE_FIELDS.map((field) => (
                  <TextField
                    key={field.key}
                    field={field}
                    value={form[field.key] as string}
                    onChange={(value) => setField(field.key, value)}
                  />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup title="Links">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {LINK_FIELDS.map((field) => (
                  <TextField
                    key={field.key}
                    field={field}
                    value={form[field.key] as string}
                    onChange={(value) => setField(field.key, value)}
                  />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup title="Status">
              <div className="flex flex-wrap gap-3">
                <ToggleField
                  label="Verified"
                  description="Member has full access"
                  checked={form.verified}
                  onChange={(value) => setField("verified", value)}
                />
                <ToggleField
                  label="Copied"
                  description="Record copied to roster"
                  checked={form.copied}
                  onChange={(value) => setField("copied", value)}
                />
              </div>
            </FieldGroup>

            <div className="mt-6 rounded-xl border border-[#a52a2a]/30 bg-[#a52a2a]/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#a52a2a]">Votes</p>
                  <p className="text-xs text-muted">
                    {voteCount} vote(s) on record · votes can only be wiped, not edited
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleWipeVotes}
                  disabled={wiping || voteCount === 0}
                  className="rounded-full border border-[#a52a2a] px-4 py-1.5 text-sm font-medium text-[#a52a2a] transition-colors hover:bg-[#a52a2a] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {wiping ? "Wiping…" : "Wipe votes"}
                </button>
              </div>
            </div>

            {modalError && <p className="mt-4 text-sm text-[#a52a2a]">{modalError}</p>}

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-muted-surface disabled:opacity-50"
              >
                Cancel
              </button>
              <Button
                onClick={handleSave}
                disabled={saving}
                text={saving ? "Saving…" : "Save changes"}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const STAT_TONES = {
  brand: "bg-brand/10 text-brand",
  green: "bg-[#228b22]/10 text-[#228b22]",
  gold: "bg-gold/15 text-gold-ink",
  maroon: "bg-maroon/10 text-maroon",
} as const;

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: keyof typeof STAT_TONES;
  icon: ReactNode;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${STAT_TONES[tone]}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div>
        <p className="text-2xl font-extrabold leading-none text-ink tabular-nums">{value}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      </div>
    </div>
  );
}

function StatusPill({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        on ? "bg-[#228b22]/10 text-[#228b22]" : "bg-muted-surface text-muted"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${on ? "bg-[#228b22]" : "bg-muted"}`}
        aria-hidden="true"
      />
      {on ? onLabel : offLabel}
    </span>
  );
}

function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
      {children}
    </div>
  );
}

function TextField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-ink">{field.label}</span>
      <input
        type="text"
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-maroon"
      />
    </label>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
        checked ? "border-maroon bg-maroon/5" : "border-line bg-white hover:bg-surface-soft"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-maroon"
      />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="block text-xs text-muted">{description}</span>
      </span>
    </label>
  );
}

function IconPeople() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4 12 14.01l-3-3" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function IconBallot() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 10 2 2 4-4" />
      <path d="M16 15h2" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default AdminMembersPanel;
