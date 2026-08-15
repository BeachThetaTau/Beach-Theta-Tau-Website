import type { MemberProfile } from "@beach-theta-tau/contracts";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { assetUrl } from "@/shared/lib/assets";
import { memberPhotoUrl } from "../../utils/member-sorting";

interface MemberCardProps {
  member: MemberProfile;
  showPosition?: boolean;
  onSelect: (member: MemberProfile) => void;
}

export function MemberCard({ member, showPosition = false, onSelect }: MemberCardProps) {
  const fallback = assetUrl("Brothers/blank-pfp.webp");

  return (
    <button
      type="button"
      className="group flex w-full flex-col text-left transition-transform duration-200 hover:-translate-y-1"
      onClick={() => onSelect(member)}
    >
      <div className="overflow-hidden rounded-lg shadow-card">
        <LazyLoadImage
          effect="blur"
          className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          src={assetUrl(memberPhotoUrl(member)) || fallback}
          onError={(event) => {
            event.currentTarget.src = fallback;
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
