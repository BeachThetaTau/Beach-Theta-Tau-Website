import { beforeEach, describe, expect, it, vi } from "vitest";

const getDocs = vi.fn();

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: (...args: unknown[]) => getDocs(...args),
}));
vi.mock("@/shared/lib/firebase/firestore", () => ({ db: {} }));

import {
  MEMBERS_CACHE_TTL_MS,
  clearMembersCache,
  getMajorCounts,
  getVerifiedMembers,
  peekCachedMembers,
} from "./members.repository";

function snapshot(rows: Array<Record<string, unknown>>) {
  return {
    docs: rows.map((row, index) => ({ id: `uid-${index}`, data: () => row })),
  };
}

const rows = [
  {
    name: "Alex Smith",
    class: "Alpha",
    major: "Computer Science",
    gradYear: "2026",
    email: "alex@example.com",
    votes: { c1: "yes" },
    verified: true,
  },
  { name: "Jordan Lee", class: "Beta", major: "Computer Science", verified: true },
  { name: "Sam Cruz", class: "Beta", major: "Civil Engineering", verified: true },
];

describe("members repository cache", () => {
  beforeEach(() => {
    vi.useRealTimers();
    clearMembersCache();
    getDocs.mockReset();
    getDocs.mockResolvedValue(snapshot(rows));
  });

  it("only keeps display fields (no emails or votes)", async () => {
    const [first] = await getVerifiedMembers();
    expect(first).toMatchObject({ uid: "uid-0", name: "Alex Smith", major: "Computer Science" });
    expect(first).not.toHaveProperty("email");
    expect(first).not.toHaveProperty("votes");
    expect(window.sessionStorage.getItem("btt:verified-members:v1")).not.toContain("alex@");
  });

  it("serves repeat calls from cache and shares one in-flight request", async () => {
    await Promise.all([getVerifiedMembers(), getVerifiedMembers(), getMajorCounts()]);
    await getVerifiedMembers();
    expect(getDocs).toHaveBeenCalledTimes(1);
  });

  it("refetches once the cache is stale, but still exposes it via peek", async () => {
    vi.useFakeTimers();
    await getVerifiedMembers();
    vi.advanceTimersByTime(MEMBERS_CACHE_TTL_MS + 1);
    expect(peekCachedMembers()).toMatchObject({ fresh: false });
    await getVerifiedMembers();
    expect(getDocs).toHaveBeenCalledTimes(2);
    expect(peekCachedMembers()).toMatchObject({ fresh: true });
  });

  it("restores the directory from sessionStorage after a reload", async () => {
    await getVerifiedMembers();
    // Simulate a fresh page load: module memory is gone, sessionStorage remains.
    vi.resetModules();
    const reloaded = await import("./members.repository");
    expect(reloaded.peekCachedMembers()?.members).toHaveLength(3);
  });

  it("counts members per major from the shared cache", async () => {
    expect(await getMajorCounts()).toEqual({ "Civil Engineering": 1, "Computer Science": 2 });
  });

  it("does not cache failures", async () => {
    getDocs.mockRejectedValueOnce(new Error("offline"));
    await expect(getVerifiedMembers()).rejects.toThrow("offline");
    await expect(getVerifiedMembers()).resolves.toHaveLength(3);
  });
});
