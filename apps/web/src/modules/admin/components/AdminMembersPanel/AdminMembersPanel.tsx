import type { MemberProfile } from "@beach-theta-tau/contracts";
import {
  EXECUTIVE_BOARD_POSITIONS,
  COMMITTEE_CHAIR_POSITIONS,
} from "@beach-theta-tau/contracts";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  adminDeleteAlumni,
  adminDeleteUser,
  adminGraduateUser,
  adminRestoreAlumni,
  adminUpdateUser,
  listAllAlumni,
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

const BASE_PROFILE_FIELDS: ReadonlyArray<FieldDef> = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "class", label: "Class" },
  { key: "gradYear", label: "Grad year" },
  { key: "major", label: "Major" },
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

function isExecutiveBoard(position?: string): boolean {
  if (!position) return false;
  return (EXECUTIVE_BOARD_POSITIONS as readonly string[]).includes(position);
}

export function AdminMembersPanel({ refreshKey }: { refreshKey?: number } = {}) {
  const [users, setUsers] = useState<MemberProfile[]>([]);
  const [alumni, setAlumni] = useState<MemberProfile[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "alumni">("active");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<MemberProfile | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [usersList, alumniList] = await Promise.all([
          listAllUsers(),
          listAllAlumni().catch(() => []),
        ]);
        if (active) {
          setUsers(usersList);
          setAlumni(alumniList);
        }
      } catch {
        if (active) setLoadError("Could not load members. Check your permissions and try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const stats = useMemo(() => {
    const verified = users.filter((user) => Boolean(user.verified)).length;
    const admins = users.filter((user) => Boolean(user.isAdmin || user.role === "admin")).length;
    const votes = users.reduce((sum, user) => sum + Object.keys(user.votes ?? {}).length, 0);
    return {
      total: users.length,
      verified,
      pending: users.length - verified,
      admins,
      votes,
      alumni: alumni.length,
    };
  }, [users, alumni]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [
        user.name,
        user.email,
        user.major,
        user.position,
        user.class,
        user.gradYear,
        user.isAdmin || user.role === "admin" ? "admin" : "",
      ]
        .filter((value): value is string => typeof value === "string")
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [users, search]);

  const filteredAlumni = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return alumni;
    return alumni.filter((alum) =>
      [alum.name, alum.email, alum.major, alum.position, alum.class, alum.gradYear]
        .filter((value): value is string => typeof value === "string")
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [alumni, search]);

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
        prev.map((user) =>
          user.uid === selected.uid
            ? {
                ...user,
                ...payload,
              }
            : user,
        ),
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

  async function handleGraduateUser(member: MemberProfile) {
    if (!member.uid) return;
    const displayName = member.name || member.email || "this user";
    if (
      !window.confirm(
        `Graduate ${displayName}?\n\nThis will move their profile to the "Alumni" collection and remove them from active users.`,
      )
    ) {
      return;
    }

    setActionInProgressId(member.uid);
    setModalError(null);
    try {
      await adminGraduateUser(member.uid, member);
      setUsers((prev) => prev.filter((user) => user.uid !== member.uid));
      setAlumni((prev) => [
        ...prev.filter((g) => g.uid !== member.uid),
        { ...member, verified: true },
      ]);
      if (selected?.uid === member.uid) {
        closeEditor();
      }
    } catch {
      const msg = `Could not graduate ${displayName}. Please check your permissions and try again.`;
      if (selected?.uid === member.uid) {
        setModalError(msg);
      } else {
        alert(msg);
      }
    } finally {
      setActionInProgressId(null);
    }
  }

  async function handleDeleteUser(member: MemberProfile) {
    if (!member.uid) return;
    const displayName = member.name || member.email || "this user";
    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${displayName}?\n\nThis action cannot be undone.`,
      )
    ) {
      return;
    }

    setActionInProgressId(member.uid);
    setModalError(null);
    try {
      await adminDeleteUser(member.uid);
      setUsers((prev) => prev.filter((user) => user.uid !== member.uid));
      if (selected?.uid === member.uid) {
        closeEditor();
      }
    } catch {
      const msg = `Could not delete ${displayName}. Please check your permissions and try again.`;
      if (selected?.uid === member.uid) {
        setModalError(msg);
      } else {
        alert(msg);
      }
    } finally {
      setActionInProgressId(null);
    }
  }

  async function handleRestoreAlumni(alum: MemberProfile) {
    if (!alum.uid) return;
    const displayName = alum.name || alum.email || "this alumnus";
    if (
      !window.confirm(
        `Restore ${displayName} back to active members?\n\nThis will move their record back to the "users" collection.`,
      )
    ) {
      return;
    }

    setActionInProgressId(alum.uid);
    try {
      await adminRestoreAlumni(alum.uid, alum);
      setAlumni((prev) => prev.filter((g) => g.uid !== alum.uid));
      setUsers((prev) =>
        [...prev, { ...alum, verified: true, copied: false, votes: {} }].sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? ""),
        ),
      );
    } catch {
      alert(`Could not restore ${displayName}. Please try again.`);
    } finally {
      setActionInProgressId(null);
    }
  }

  async function handleDeleteAlumni(alum: MemberProfile) {
    if (!alum.uid) return;
    const displayName = alum.name || alum.email || "this alumnus";
    if (
      !window.confirm(
        `Permanently delete alumni record for ${displayName}?\n\nThis cannot be undone.`,
      )
    ) {
      return;
    }

    setActionInProgressId(alum.uid);
    try {
      await adminDeleteAlumni(alum.uid);
      setAlumni((prev) => prev.filter((g) => g.uid !== alum.uid));
    } catch {
      alert(`Could not delete alumni record for ${displayName}. Please try again.`);
    } finally {
      setActionInProgressId(null);
    }
  }

  if (loading) return <LoadingState label="Loading members…" />;
  if (loadError) return <EmptyState title="Unable to load members" description={loadError} />;

  const voteCount = Object.keys(selected?.votes ?? {}).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Active Members" value={stats.total} tone="brand" icon={<IconPeople />} />
        <StatCard label="Verified" value={stats.verified} tone="green" icon={<IconCheck />} />
        <StatCard label="Pending" value={stats.pending} tone="gold" icon={<IconClock />} />
        <StatCard label="Admins" value={stats.admins} tone="purple" icon={<IconShield />} />
        <StatCard label="Alumni" value={stats.alumni} tone="amber" icon={<IconMortarboard />} />
        <StatCard label="Votes cast" value={stats.votes} tone="maroon" icon={<IconBallot />} />
      </div>

      <section className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="subsection-title">Member management</h2>
              <p className="mt-1 text-sm text-muted">
                Manage member positions, verification, alumni/graduation status, and user records.
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
                placeholder="Search name, email, major, position, admin…"
                className="w-full rounded-full border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink shadow-sm outline-none transition-colors focus:border-maroon"
                aria-label="Search members"
              />
            </div>
          </div>

          <div className="flex border-b border-line">
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === "active"
                  ? "border-maroon text-maroon"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <IconPeople />
              Active Members
              <span className="rounded-full bg-surface-soft px-2 py-0.5 text-xs text-muted">
                {users.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("alumni")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === "alumni"
                  ? "border-maroon text-maroon"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <IconMortarboard />
              Alumni Collection
              <span className="rounded-full bg-surface-soft px-2 py-0.5 text-xs text-muted">
                {alumni.length}
              </span>
            </button>
          </div>
        </div>

        {activeTab === "active" && (
          <>
            {filteredUsers.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-line bg-white/60 px-6 py-12 text-center">
                <p className="font-medium text-ink">No active members match your search</p>
                <p className="mt-1 text-sm text-muted">Try a different name, email, major, position, or "admin".</p>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-surface-soft text-xs uppercase tracking-wide text-muted">
                        <th className="px-4 py-3 font-semibold">Member</th>
                        <th className="px-4 py-3 font-semibold">Class</th>
                        <th className="px-4 py-3 font-semibold">Position</th>
                        <th className="px-4 py-3 font-semibold">Verified</th>
                        <th className="px-4 py-3 font-semibold">Copied</th>
                        <th className="px-4 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const isOperating = actionInProgressId === user.uid;
                        const isUserAdmin = Boolean(user.isAdmin || user.role === "admin");
                        return (
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
                                  <div className="flex items-center gap-1.5">
                                    <p className="truncate font-semibold text-ink">
                                      {user.name || "Unnamed member"}
                                    </p>
                                    {isUserAdmin && (
                                      <span
                                        className="inline-flex items-center gap-0.5 rounded bg-purple-100 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider text-purple-800"
                                        title="Administrator"
                                      >
                                        <IconShield className="h-2.5 w-2.5" />
                                        Admin
                                      </span>
                                    )}
                                  </div>
                                  <p className="truncate text-xs text-muted">
                                    {user.email || "No email"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted">{user.class || "—"}</td>
                            <td className="px-4 py-3">
                              <PositionBadge position={user.position} />
                            </td>
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
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditor(user)}
                                  disabled={isOperating}
                                  className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink transition-colors hover:border-maroon hover:bg-maroon hover:text-white disabled:opacity-50"
                                  title="Edit member profile, position & admin status"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGraduateUser(user)}
                                  disabled={isOperating}
                                  className="inline-flex items-center gap-1 rounded-full border border-amber-600/30 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-600 hover:text-white disabled:opacity-50"
                                  title="Graduate member and move to Alumni collection"
                                >
                                  <IconMortarboard className="h-3.5 w-3.5" />
                                  <span>Graduate</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(user)}
                                  disabled={isOperating}
                                  className="inline-flex items-center rounded-full border border-red-200 bg-red-50 p-1.5 text-xs text-red-700 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
                                  title="Permanently delete user"
                                  aria-label={`Delete ${user.name || "user"}`}
                                >
                                  <IconTrash className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "alumni" && (
          <>
            {filteredAlumni.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-line bg-white/60 px-6 py-12 text-center">
                <p className="font-medium text-ink">No alumni records found</p>
                <p className="mt-1 text-sm text-muted">
                  When you graduate members, they will appear here in the Alumni collection.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-surface-soft text-xs uppercase tracking-wide text-muted">
                        <th className="px-4 py-3 font-semibold">Alumnus</th>
                        <th className="px-4 py-3 font-semibold">Class / Grad Year</th>
                        <th className="px-4 py-3 font-semibold">Major</th>
                        <th className="px-4 py-3 font-semibold">Last Position</th>
                        <th className="px-4 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAlumni.map((alum) => {
                        const isOperating = actionInProgressId === alum.uid;
                        return (
                          <tr
                            key={alum.uid}
                            className="border-b border-line/60 align-middle transition-colors last:border-b-0 hover:bg-surface-soft"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span
                                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-800"
                                  aria-hidden="true"
                                >
                                  {initials(alum.name, alum.email)}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-ink">
                                    {alum.name || "Unnamed alumnus"}
                                  </p>
                                  <p className="truncate text-xs text-muted">
                                    {alum.email || "No email"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted">
                              {[alum.class, alum.gradYear].filter(Boolean).join(" · ") || "—"}
                            </td>
                            <td className="px-4 py-3 text-muted">{alum.major || "—"}</td>
                            <td className="px-4 py-3">
                              <PositionBadge position={alum.position} />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleRestoreAlumni(alum)}
                                  disabled={isOperating}
                                  className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink transition-colors hover:border-brand hover:bg-brand/10 hover:text-brand disabled:opacity-50"
                                  title="Restore back to active members collection"
                                >
                                  <IconRestore className="h-3.5 w-3.5" />
                                  <span>Restore</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAlumni(alum)}
                                  disabled={isOperating}
                                  className="inline-flex items-center rounded-full border border-red-200 bg-red-50 p-1.5 text-xs text-red-700 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
                                  title="Permanently delete from Alumni collection"
                                  aria-label={`Delete ${alum.name || "alumnus"}`}
                                >
                                  <IconTrash className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <Modal isOpen={Boolean(selected && form)} onClose={closeEditor} ariaLabel="Edit member">
        {form && selected && (
          <div className="w-[min(90vw,40rem)] max-h-[85vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-4 border-b border-line pb-5">
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand/10 text-sm font-bold text-brand"
                aria-hidden="true"
              >
                {initials(selected.name, selected.email)}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-xl font-bold text-ink">
                    {selected.name || "Edit member"}
                  </h3>
                  {Boolean(selected.isAdmin || selected.role === "admin") && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-purple-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-purple-800">
                      <IconShield className="h-3 w-3" />
                      Admin
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted">User ID: {selected.uid}</p>
              </div>
            </div>

            <FieldGroup title="Profile Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {BASE_PROFILE_FIELDS.map((field) => (
                  <TextField
                    key={field.key}
                    field={field}
                    value={form[field.key] as string}
                    onChange={(value) => setField(field.key, value)}
                  />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup title="Chapter Position">
              <PositionSelector
                value={form.position}
                onChange={(newPosition) => setField("position", newPosition)}
              />
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
                  description="Member has full access & appears on directory"
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

            <div className="mt-6 rounded-xl border border-line bg-surface-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Account Actions
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleGraduateUser(selected)}
                  disabled={saving || actionInProgressId === selected.uid}
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-600/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
                >
                  <IconMortarboard className="h-4 w-4" />
                  <span>Graduate Account (Move to Alumni)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteUser(selected)}
                  disabled={saving || actionInProgressId === selected.uid}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                >
                  <IconTrash className="h-4 w-4" />
                  <span>Delete User</span>
                </button>
              </div>
            </div>

            {modalError && <p className="mt-4 text-sm text-[#a52a2a]">{modalError}</p>}

            <div className="mt-8 flex justify-end gap-3 border-t border-line pt-4">
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

function PositionSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const isStandardOption =
    !value ||
    (EXECUTIVE_BOARD_POSITIONS as readonly string[]).includes(value) ||
    (COMMITTEE_CHAIR_POSITIONS as readonly string[]).includes(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Select Standard Position</span>
          <select
            value={isStandardOption ? value : "__custom__"}
            onChange={(e) => {
              const selectedValue = e.target.value;
              if (selectedValue !== "__custom__") {
                onChange(selectedValue);
              }
            }}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-maroon"
          >
            <option value="">None / General Member</option>
            <optgroup label="Executive Board">
              {EXECUTIVE_BOARD_POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </optgroup>
            <optgroup label="Committee Chairs & Officers">
              {COMMITTEE_CHAIR_POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </optgroup>
            <option value="__custom__">Custom title...</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Position Title (or Custom)</span>
          <input
            type="text"
            value={value}
            placeholder="e.g. Regent, Social Chair, Webmaster..."
            onChange={(event) => onChange(event.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-maroon"
          />
        </label>
      </div>
      <p className="text-xs text-muted">
        Setting an Executive Board role (Regent, Treasurer, etc.) places the member on the Executive
        Board display; any other position displays as a Committee Chair / Officer.
      </p>
    </div>
  );
}

function PositionBadge({ position }: { position?: string }) {
  if (!position) return <span className="text-muted">—</span>;

  if (isExecutiveBoard(position)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-maroon/10 px-2.5 py-0.5 text-xs font-semibold text-maroon">
        <span className="h-1.5 w-1.5 rounded-full bg-maroon" aria-hidden="true" />
        {position}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
      {position}
    </span>
  );
}

const STAT_TONES = {
  brand: "bg-brand/10 text-brand",
  green: "bg-[#228b22]/10 text-[#228b22]",
  gold: "bg-gold/15 text-gold-ink",
  purple: "bg-purple-100 text-purple-800",
  amber: "bg-amber-500/15 text-amber-800",
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

function IconTrash({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function IconMortarboard({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function IconRestore({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function IconShield({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export default AdminMembersPanel;



