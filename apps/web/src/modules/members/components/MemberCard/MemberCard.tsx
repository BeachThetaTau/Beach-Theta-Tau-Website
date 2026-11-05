import type { MemberProfile } from "@beach-theta-tau/contracts";
import { assetUrl } from "@/shared/lib/assets";
import { prefetchMemberPhoto } from "../../utils/member-photos";
import { memberThumbUrl } from "../../utils/member-sorting";

interface MemberCardProps {
  member: MemberProfile;
  showPosition?: boolean;
  /** Native image loading strategy. Defaults to "lazy" (e.g. officer cards). */
  loading?: "eager" | "lazy";
  /** Ask the browser to fetch this photo first (top-of-page cards). */
  highPriority?: boolean;
  onSelect: (member: MemberProfile) => void;
}

/** React 18 needs the lowercase fetch priority attribute. */
const priorityHint = (highPriority: boolean) =>
  (highPriority ? { fetchpriority: "high" } : {}) as Record<string, string>;

export function MemberCard({
  member,
  showPosition = false,
  loading = "lazy",
  highPriority = false,
  onSelect,
}: MemberCardProps) {
  const fallback = assetUrl("Brothers/blank-pfp.webp");

  const warmModalPhoto = () => prefetchMemberPhoto(member);

  return (
    <button
      type="button"
      className="group flex w-full flex-col text-left transition-transform duration-200 hover:-translate-y-1"
      onClick={() => onSelect(member)}
      onPointerEnter={warmModalPhoto}
      onFocus={warmModalPhoto}
    >
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-panel shadow-card">
        <img
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          src={assetUrl(memberThumbUrl(member)) || fallback}
          width={400}
          height={533}
          loading={loading}
          {...priorityHint(highPriority)}
          decoding="async"
          onError={(event) => {
            const image = event.currentTarget;
            if (image.src !== fallback) image.src = fallback;
          }}
          alt={`${member.name}'s profile`}
        />
      </div>
      <h3 className="mt-3 text-lg font-bold leading-tight text-ink">{member.name}</h3>
      {showPosition ? (
        <p className="m-0 text-sm text-brand">{member.position}</p>
      ) : (
        <p className="m-0 text-sm text-muted">
          {member.major || "Major not listed"} · {member.gradYear || "Year not listed"}
        </p>
      )}
    </button>
  );
}
