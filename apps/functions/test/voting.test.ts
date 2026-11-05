import type { CallableRequest } from "firebase-functions/v2/https";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, set, collectionGet, runTransaction } = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  collectionGet: vi.fn(),
  runTransaction: vi.fn(),
}));
vi.mock("../src/shared/firebase-admin.js", () => ({
  adminDb: {
    doc: (path: string) => path,
    collection: () => ({ get: collectionGet }),
    runTransaction,
  },
}));
import { castVote } from "../src/deliberations/cast-vote";
import { aggregateVotes } from "../src/deliberations/aggregate-votes";

const request = (data: unknown, role = "member") =>
  ({
    data,
    auth: { uid: "voter", token: { role } },
  }) as CallableRequest<any>;

beforeEach(() => {
  vi.resetAllMocks();
  runTransaction.mockImplementation((callback) => callback({ get, set }));
  get.mockImplementation(async (path) => ({
    data: () =>
      path === "users/voter"
        ? { verified: true, votes: { other: "no", candidate: "abstain" } }
        : { selectedDelib: "candidate" },
  }));
});

describe("casting votes", () => {
  it.each(["yes", "no", "abstain", null])(
    "saves choice %s while preserving other votes",
    async (vote) => {
      expect(await castVote.run(request({ candidateId: " candidate ", vote }))).toEqual({
        candidateId: "candidate",
        vote,
      });
      expect(set).toHaveBeenCalledWith(
        "users/voter",
        { votes: vote ? { other: "no", candidate: vote } : { other: "no" } },
        { merge: true },
      );
    },
  );
  it.each(["maybe", "", undefined, 1])(
    "rejects unsupported choice %s before starting a transaction",
    async (vote) => {
      await expect(castVote.run(request({ candidateId: "candidate", vote }))).rejects.toMatchObject(
        { code: "invalid-argument" },
      );
      expect(runTransaction).not.toHaveBeenCalled();
    },
  );
  it.each([undefined, false, "true"])(
    "prevents unverified members from voting (%s)",
    async (verified) => {
      get.mockResolvedValue({ data: () => ({ verified, selectedDelib: "candidate" }) });
      await expect(
        castVote.run(request({ candidateId: "candidate", vote: "yes" })),
      ).rejects.toMatchObject({ code: "permission-denied" });
      expect(set).not.toHaveBeenCalled();
    },
  );
  it.each(["", "different"])(
    "rejects closed voting or a different active candidate (%s)",
    async (selectedDelib) => {
      get.mockImplementation(async (path) => ({
        data: () => (path === "users/voter" ? { verified: true } : { selectedDelib }),
      }));
      await expect(
        castVote.run(request({ candidateId: "candidate", vote: "yes" })),
      ).rejects.toMatchObject({ code: "failed-precondition" });
      expect(set).not.toHaveBeenCalled();
    },
  );
  it("propagates transaction errors", async () => {
    runTransaction.mockRejectedValue(new Error("unavailable"));
    await expect(castVote.run(request({ candidateId: "candidate", vote: "yes" }))).rejects.toThrow(
      "unavailable",
    );
  });
});

describe("vote aggregation", () => {
  it("counts only supported votes for the requested candidate and rounds percentages", async () => {
    const rows = [
      { votes: { candidate: "yes" } },
      { votes: { candidate: "no" } },
      { votes: { candidate: "abstain" } },
      { votes: { candidate: "invalid" } },
      { votes: { other: "yes" } },
      {},
    ];
    collectionGet.mockResolvedValue({ docs: rows.map((row) => ({ data: () => row })) });
    await expect(
      aggregateVotes.run(request({ candidateId: "candidate" }, "admin")),
    ).resolves.toEqual({
      yes: 1,
      no: 1,
      abstain: 1,
      total: 3,
      yesPercent: 33,
      noPercent: 33,
      abstainPercent: 33,
    });
  });
  it("returns zero percentages when no votes exist", async () => {
    collectionGet.mockResolvedValue({ docs: [] });
    await expect(
      aggregateVotes.run(request({ candidateId: "candidate" }, "admin")),
    ).resolves.toEqual({
      yes: 0,
      no: 0,
      abstain: 0,
      total: 0,
      yesPercent: 0,
      noPercent: 0,
      abstainPercent: 0,
    });
  });
  it("denies non-admins before reading votes", async () => {
    await expect(aggregateVotes.run(request({ candidateId: "candidate" }))).rejects.toMatchObject({
      code: "permission-denied",
    });
    expect(collectionGet).not.toHaveBeenCalled();
  });
  it("propagates database errors", async () => {
    collectionGet.mockRejectedValue(new Error("offline"));
    await expect(
      aggregateVotes.run(request({ candidateId: "candidate" }, "admin")),
    ).rejects.toThrow("offline");
  });
});
