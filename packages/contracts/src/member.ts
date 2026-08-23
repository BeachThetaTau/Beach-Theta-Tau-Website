import type { AppRole } from "./roles.js";

export interface MemberProfile {
  uid?: string;
  name: string;
  email?: string;
  class: string;
  gradYear?: string;
  major?: string;
  linkedIn?: string;
  resumeLink?: string;
  position?: string;
  verified?: boolean;
  copied?: boolean;
  isAdmin?: boolean;
  role?: AppRole;
  votes?: Record<string, string>;
  graduatedAt?: unknown;
}

export type EditableMemberProfile = Pick<
  MemberProfile,
  "name" | "major" | "class" | "gradYear" | "linkedIn" | "resumeLink"
>;

export interface GraduateProfile extends Omit<MemberProfile, "votes" | "copied"> {
  graduatedAt?: unknown;
}

export const EXECUTIVE_BOARD_POSITIONS = [
  "Regent",
  "Vice-Regent",
  "Treasurer",
  "Scribe",
  "Corresponding Secretary",
  "Marshal",
] as const;

export const COMMITTEE_CHAIR_POSITIONS = [
  "Alumni Relations Chair",
  "Engineering Chair",
  "Fundraising Chair",
  "Professionalism Chair",
  "Recruitment Chair",
  "S.H.I.E.L.D Chair",
  "Social Media Chair",
  "Webmaster",
] as const;

export const STANDARD_POSITIONS = [
  ...EXECUTIVE_BOARD_POSITIONS,
  ...COMMITTEE_CHAIR_POSITIONS,
] as const;


