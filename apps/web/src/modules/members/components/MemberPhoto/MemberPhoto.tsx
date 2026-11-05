import type { MemberProfile } from "@beach-theta-tau/contracts";
import { useState } from "react";
import { FaUserTie } from "react-icons/fa";
import { memberPhotoSources } from "../../utils/member-photos";

interface MemberPhotoProps {
  member: Pick<MemberProfile, "name" | "verified">;
  size?: "thumbnail" | "full";
  loading?: "eager" | "lazy";
  highPriority?: boolean;
  className?: string;
}

/** Each portrait URL gets one attempt before displaying the profile icon. */
export function MemberPhoto({
  member,
  size = "thumbnail",
  loading = "eager",
  highPriority = false,
  className = "h-full w-full object-cover",
}: MemberPhotoProps) {
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const src = memberPhotoSources(member, size).find((url) => !failed.has(url));
  const alt = `${member.name}'s profile`;

  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-panel text-muted ${className}`}
      >
        <FaUserTie className="h-2/3 w-2/3" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      width={size === "full" ? 900 : 400}
      height={size === "full" ? 1200 : 533}
      loading={loading}
      decoding="async"
      {...(highPriority ? { fetchpriority: "high" } : {})}
      onError={() => setFailed((previous) => new Set(previous).add(src))}
    />
  );
}
