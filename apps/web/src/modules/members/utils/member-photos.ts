import type { MemberProfile } from "@beach-theta-tau/contracts";
import { assetUrl } from "@/shared/lib/assets";
import { memberPhotoUrl } from "./member-sorting";

const prefetched = new Set<string>();

/** Warm the full-size photo on card hover/focus for the details modal. */
export function prefetchMemberPhoto(member: Pick<MemberProfile, "name" | "verified">) {
  const url = assetUrl(memberPhotoUrl(member));
  if (!url || prefetched.has(url) || typeof Image === "undefined") return;
  prefetched.add(url);
  const image = new Image();
  image.decoding = "async";
  image.src = url;
}
