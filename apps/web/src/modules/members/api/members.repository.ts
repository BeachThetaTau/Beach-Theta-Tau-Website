import type { MemberProfile } from "@beach-theta-tau/contracts";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/shared/lib/firebase/firestore";

/** How long a cached directory is considered fresh before we hit Firestore again. */
export const MEMBERS_CACHE_TTL_MS = 10 * 60 * 1000;
const STORAGE_KEY = "btt:verified-members:v1";

interface CacheEntry {
  members: MemberProfile[];
  fetchedAt: number;
}

let memoryCache: CacheEntry | null = null;
let inflight: Promise<MemberProfile[]> | null = null;

/** Only cache public directory fields, never emails or votes. */
function toDirectoryProfile(uid: string, data: Partial<MemberProfile>): MemberProfile {
  const profile: MemberProfile = {
    uid,
    name: data.name ?? "",
    class: data.class ?? "",
    verified: data.verified,
  };
  if (data.gradYear) profile.gradYear = data.gradYear;
  if (data.major) profile.major = data.major;
  if (data.position) profile.position = data.position;
  if (data.linkedIn) profile.linkedIn = data.linkedIn;
  if (data.resumeLink) profile.resumeLink = data.resumeLink;
  return profile;
}

function readStoredCache(): CacheEntry | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CacheEntry>;
    if (!Array.isArray(parsed.members) || typeof parsed.fetchedAt !== "number") return null;
    return { members: parsed.members, fetchedAt: parsed.fetchedAt };
  } catch {
    return null;
  }
}

function writeCache(entry: CacheEntry) {
  memoryCache = entry;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Storage can be full or blocked (private mode); the in-memory copy still works.
  }
}

function isFresh(entry: CacheEntry) {
  return Date.now() - entry.fetchedAt < MEMBERS_CACHE_TTL_MS;
}

/** Return the cached directory regardless of age for immediate rendering. */
export function peekCachedMembers(): { members: MemberProfile[]; fresh: boolean } | null {
  const entry = memoryCache ?? readStoredCache();
  if (!entry) return null;
  memoryCache = entry;
  return { members: entry.members, fresh: isFresh(entry) };
}

/** Test helper / manual invalidation (e.g. after an admin verifies someone). */
export function clearMembersCache() {
  memoryCache = null;
  inflight = null;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Serve fresh cache entries and share a single request between callers. */
export function getVerifiedMembers(): Promise<MemberProfile[]> {
  const cached = peekCachedMembers();
  if (cached?.fresh) return Promise.resolve(cached.members);
  if (inflight) return inflight;

  inflight = getDocs(query(collection(db, "users"), where("verified", "==", true)))
    .then((snapshot) => {
      const members = snapshot.docs.map((memberDocument) =>
        toDirectoryProfile(memberDocument.id, memberDocument.data() as Partial<MemberProfile>),
      );
      writeCache({ members, fetchedAt: Date.now() });
      return members;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export async function getMajorCounts(): Promise<Record<string, number>> {
  const members = await getVerifiedMembers();
  const counts: Record<string, number> = {};

  for (const { major } of members) {
    if (typeof major === "string" && major.trim()) {
      counts[major] = (counts[major] ?? 0) + 1;
    }
  }

  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  );
}
