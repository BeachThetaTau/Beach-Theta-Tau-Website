import type { MemberProfile } from "@beach-theta-tau/contracts";
import { findAssetUrl } from "@/shared/lib/assets";
import { memberPhotoUrl, memberThumbUrl } from "./member-sorting";

type PhotoMember = Pick<MemberProfile, "name" | "verified">;
const prefetched = new Set<string>();

/** Resolve only files present in the build. Missing portraits are normal. */
export function memberPhotoSources(member: PhotoMember, size: "thumbnail" | "full") {
  const full = findAssetUrl(`members/${memberPhotoUrl(member)}`);
  const thumb = findAssetUrl(memberThumbUrl(member));
  const placeholder = findAssetUrl("members/Brothers/blank-pfp.webp");
  return [
    ...new Set(
      (size === "thumbnail" ? [thumb, full, placeholder] : [full, thumb, placeholder]).filter(
        (url): url is string => Boolean(url),
      ),
    ),
  ];
}

/** Warm only an existing portrait, never a guessed URL or placeholder. */
export function prefetchMemberPhoto(member: PhotoMember) {
  if (!member.verified || typeof Image === "undefined") return;
  const url = findAssetUrl(`members/${memberPhotoUrl(member)}`);
  if (!url || prefetched.has(url)) return;
  prefetched.add(url);
  const image = new Image();
  image.decoding = "async";
  image.onerror = () => prefetched.delete(url);
  image.src = url;
}
