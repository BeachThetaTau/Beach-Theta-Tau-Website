import type { MemberProfile } from "@beach-theta-tau/contracts";

interface ProfileViewProps {
  profile: MemberProfile;
  onEdit: () => void;
  editIconUrl: string;
}

const labels: Record<string, string> = {
  name: "Name",
  major: "Major",
  class: "Class",
  gradYear: "Graduation Year",
  linkedIn: "LinkedIn",
  resumeLink: "Resume Link",
};

const fields = ["name", "major", "class", "gradYear", "linkedIn", "resumeLink"] as const;

function displayValue(profile: MemberProfile, field: (typeof fields)[number]) {
  const value = profile[field];
  if (!value) return "N/A";
  if ((field === "linkedIn" || field === "resumeLink") && value.length > 35) {
    return `${value.slice(0, 35)}…`;
  }
  return value;
}

export function ProfileView({ profile, onEdit, editIconUrl }: ProfileViewProps) {
  return (
    <>
      <dl className="divide-y divide-line">
        {fields.map((field) => (
          <div key={field} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 py-3">
            <dt className="text-sm font-semibold uppercase tracking-wide text-muted">
              {labels[field]}
            </dt>
            <dd className="m-0 break-words text-text">{displayValue(profile, field)}</dd>
          </div>
        ))}
      </dl>
      <button
        className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-brand px-6 py-2.5 font-semibold text-brand transition-colors hover:bg-surface-soft"
        type="button"
        onClick={onEdit}
        aria-label="Edit profile"
      >
        Edit Profile
        <img className="h-4 w-4" src={editIconUrl} alt="" />
      </button>
    </>
  );
}
