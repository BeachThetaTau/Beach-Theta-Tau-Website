import type { DeliberationCandidate, VoteChoice, VoteTotals } from "@beach-theta-tau/contracts";
import { atom } from "jotai";

/** Live status of the global deliberations session (admin controlled) */
export const delibsSessionActiveAtom = atom<boolean>(false);

/** Active candidate ID broadcasted across the chapter */
export const activeCandidateIdAtom = atom<string | null>(null);

/** All imported deliberation candidates */
export const allCandidatesAtom = atom<DeliberationCandidate[]>([]);

/** Active candidate resolved from the candidate list */
export const activeCandidateAtom = atom<DeliberationCandidate | null>((get) => {
  const activeId = get(activeCandidateIdAtom);
  if (!activeId) return null;
  return get(allCandidatesAtom).find((candidate) => candidate.id === activeId) ?? null;
});

/** All candidates sorted alphabetically by name */
export const sortedCandidatesAtom = atom<DeliberationCandidate[]>((get) => {
  return [...get(allCandidatesAtom)].sort((left, right) => left.name.localeCompare(right.name));
});

/** Current authenticated member's votes map { [candidateId]: VoteChoice } */
export const memberVotesAtom = atom<Record<string, VoteChoice>>({});

/** Current member's vote on the active candidate */
export const currentActiveVoteAtom = atom<VoteChoice | null>((get) => {
  const activeId = get(activeCandidateIdAtom);
  if (!activeId) return null;
  return get(memberVotesAtom)[activeId] ?? null;
});

/** Live vote totals mapped by candidateId */
export const liveVoteTotalsByCandidateAtom = atom<Record<string, VoteTotals>>({});

/** Selected candidate in the admin dashboard */
export const adminSelectedCandidateAtom = atom<DeliberationCandidate | null>(null);
