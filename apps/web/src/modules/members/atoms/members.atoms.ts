import type { MemberProfile } from "@beach-theta-tau/contracts";
import { atom } from "jotai";
import { splitOfficers } from "../utils/member-sorting";

/** Full list of verified active members */
export const allMembersAtom = atom<MemberProfile[]>([]);

/** Currently selected member for modal inspection */
export const selectedMemberModalAtom = atom<MemberProfile | null>(null);

/** View toggle: true = Officer/E-board view, false = Class view */
export const showingOfficersAtom = atom<boolean>(false);

/** Search query string for member directory */
export const memberSearchQueryAtom = atom<string>("");

/** Class filter (e.g. "Alpha", "Beta", "all") */
export const memberClassFilterAtom = atom<string>("all");

/** Derived: Executive Board members */
export const executiveBoardMembersAtom = atom<MemberProfile[]>((get) => {
  const members = get(allMembersAtom);
  return splitOfficers(members).executiveBoard;
});

/** Derived: Committee Chairs & Officers */
export const chairMembersAtom = atom<MemberProfile[]>((get) => {
  const members = get(allMembersAtom);
  return splitOfficers(members).chairs;
});

/** Derived: Filtered members based on search query and class filter */
export const filteredMembersAtom = atom<MemberProfile[]>((get) => {
  const members = get(allMembersAtom);
  const query = get(memberSearchQueryAtom).toLowerCase().trim();
  const classFilter = get(memberClassFilterAtom);

  return members.filter((member) => {
    const matchesClass =
      classFilter === "all" ||
      !classFilter ||
      member.class?.toLowerCase() === classFilter.toLowerCase();

    if (!matchesClass) return false;
    if (!query) return true;

    return (
      member.name.toLowerCase().includes(query) ||
      (member.major && member.major.toLowerCase().includes(query)) ||
      (member.position && member.position.toLowerCase().includes(query)) ||
      (member.class && member.class.toLowerCase().includes(query))
    );
  });
});
