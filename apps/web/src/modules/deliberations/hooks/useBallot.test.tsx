import type { ReactNode } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { castVote, listCandidates, subscribeMemberVotes } from "../api/deliberations.repository";
import { activeCandidateIdAtom, memberVotesAtom } from "../atoms/deliberations.atoms";
import { useBallot } from "./useBallot";

const { account, active } = vi.hoisted(() => ({
  account: { uid: "voter" },
  active: { candidateId: "candidate" as string | null, loading: false, error: null },
}));
vi.mock("@/modules/auth", () => ({ useAuth: () => ({ account }) }));
vi.mock("./useActiveCandidate", () => ({ useActiveCandidate: () => active }));
vi.mock("../api/deliberations.repository", () => ({
  castVote: vi.fn(),
  listCandidates: vi.fn(),
  subscribeMemberVotes: vi.fn(),
}));
const unsubscribe = vi.fn();
beforeEach(() => {
  vi.resetAllMocks();
  active.candidateId = "candidate";
  vi.mocked(listCandidates).mockResolvedValue([{ id: "candidate", name: "Alex" }]);
  vi.mocked(subscribeMemberVotes).mockReturnValue(unsubscribe);
});
afterEach(cleanup);

async function setup(previous?: "yes" | "no") {
  const store = createStore();
  store.set(activeCandidateIdAtom, "candidate");
  store.set(memberVotesAtom, { other: "abstain", ...(previous ? { candidate: previous } : {}) });
  const hook = renderHook(useBallot, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return { ...hook, store };
}

describe("member ballot", () => {
  it("loads the candidate and unsubscribes from member votes", async () => {
    const { result, unmount } = await setup();
    expect(result.current.candidate).toEqual({ id: "candidate", name: "Alex" });
    expect(subscribeMemberVotes).toHaveBeenCalledWith(
      "voter",
      expect.any(Function),
      expect.any(Function),
    );
    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
  it("toggles a repeated choice off while retaining other candidates' votes", async () => {
    const { result, store } = await setup("yes");
    await act(async () => {
      await result.current.vote("yes");
    });
    expect(castVote).toHaveBeenCalledWith("candidate", null, "voter");
    expect(result.current.currentVote).toBeNull();
    expect(store.get(memberVotesAtom)).toEqual({ other: "abstain" });
  });
  it.each([undefined, "no"] as const)(
    "restores the previous vote after a failed optimistic write (%s)",
    async (previous) => {
      let reject!: (error: Error) => void;
      vi.mocked(castVote).mockReturnValueOnce(
        new Promise((_, fail) => {
          reject = fail;
        }),
      );
      const { result, store } = await setup(previous);
      const before = store.get(memberVotesAtom);
      let pending!: Promise<void>;
      act(() => {
        pending = result.current.vote("yes");
      });
      expect(result.current.currentVote).toBe("yes");
      expect(result.current.saving).toBe(true);
      await act(async () => {
        reject(new Error("offline"));
        await pending;
      });
      expect(store.get(memberVotesAtom)).toEqual(before);
      expect(result.current).toMatchObject({ saving: false, error: "offline" });
      await act(async () => {
        await result.current.vote("yes");
      });
      expect(result.current).toMatchObject({ currentVote: "yes", saving: false, error: null });
    },
  );
  it("does not submit votes when no candidate is active", async () => {
    active.candidateId = null;
    const { result } = await setup();
    await act(async () => {
      await result.current.vote("yes");
    });
    expect(castVote).not.toHaveBeenCalled();
  });
  it("surfaces candidate loading errors", async () => {
    vi.mocked(listCandidates).mockRejectedValueOnce(new Error("Unable to load candidates"));
    const { result } = await setup();
    expect(result.current.error).toBe("Unable to load candidates");
  });
});
