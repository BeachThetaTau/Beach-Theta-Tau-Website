import type { EditableMemberProfile } from "@beach-theta-tau/contracts";
import { profileFields } from "../../schemas/profile.schema";

interface ProfileFormProps {
  values: EditableMemberProfile;
  errors: string[];
  saving: boolean;
  onChange: (field: keyof EditableMemberProfile, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const labels: Record<keyof EditableMemberProfile, string> = {
  name: "Name",
  major: "Major",
  class: "Class",
  gradYear: "Graduation Year",
  linkedIn: "LinkedIn",
  resumeLink: "Resume Link",
};

export function ProfileForm({
  values,
  errors,
  saving,
  onChange,
  onSave,
  onCancel,
}: ProfileFormProps) {
  return (
    <div className="flex flex-col gap-4">
      {profileFields.map((field) => (
        <div key={field} className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-ink" htmlFor={`profile-${field}`}>
            {labels[field]}
          </label>
          <input
            id={`profile-${field}`}
            type="text"
            className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-base text-text outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30"
            value={values[field] ?? ""}
            onChange={(event) => onChange(field, event.target.value)}
          />
        </div>
      ))}

      {errors.length > 0 && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
          {errors.map((message) => (
            <p className="text-sm text-red-700" key={message}>
              {message}
            </p>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          className="rounded-full border-2 border-brand bg-white px-6 py-2.5 font-semibold text-brand transition-colors hover:bg-surface-soft disabled:opacity-60"
          type="button"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
