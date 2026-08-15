import type { MemberProfile } from "@beach-theta-tau/contracts";

const baseGreekAlphabet = [
  "Alpha",
  "Beta",
  "Gamma",
  "Delta",
  "Epsilon",
  "Zeta",
  "Eta",
  "Theta",
  "Iota",
  "Kappa",
  "Lambda",
  "Mu",
  "Nu",
  "Xi",
  "Omicron",
  "Pi",
  "Rho",
  "Sigma",
  "Tau",
  "Upsilon",
  "Phi",
  "Chi",
  "Psi",
  "Omega",
] as const;

export const executiveBoardOrder = [
  "Regent",
  "Vice-Regent",
  "Treasurer",
  "Scribe",
  "Corresponding Secretary",
  "Marshal",
] as const;

export const greekAlphabetOrder = [
  ...baseGreekAlphabet,
  ...baseGreekAlphabet.flatMap((first) => baseGreekAlphabet.map((second) => `${first} ${second}`)),
].reverse();

export function groupMembersByClass(members: MemberProfile[]) {
  const groups: Record<string, MemberProfile[]> = Object.fromEntries(
    greekAlphabetOrder.map((letter) => [letter, []]),
  );

  for (const member of members) {
    if (!member.class) continue;
    const group = groups[member.class];
    if (group) group.push(member);
  }

  for (const group of Object.values(groups)) group.sort((a, b) => a.name.localeCompare(b.name));
  return groups;
}

type ExecutivePosition = (typeof executiveBoardOrder)[number];

function isExecutivePosition(position: string | undefined): position is ExecutivePosition {
  return Boolean(position) && (executiveBoardOrder as readonly string[]).includes(position!);
}

export function splitOfficers(members: MemberProfile[]) {
  const executiveBoard = members
    .filter((member) => isExecutivePosition(member.position))
    .sort(
      (left, right) =>
        executiveBoardOrder.indexOf(left.position as ExecutivePosition) -
        executiveBoardOrder.indexOf(right.position as ExecutivePosition),
    );

  const chairs = members
    .filter((member) => member.position && !isExecutivePosition(member.position))
    .sort((left, right) => (left.position ?? "").localeCompare(right.position ?? ""));

  return { executiveBoard, chairs };
}

export function memberPhotoUrl(member: Pick<MemberProfile, "name" | "verified">): string {
  if (!member.verified) return "Brothers/blank-pfp.webp";
  const filename = member.name.replace(/[^a-zA-Z]/g, "").toLowerCase();
  return `Brothers/${filename}.webp`;
}
