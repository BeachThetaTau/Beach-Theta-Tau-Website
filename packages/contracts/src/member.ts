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
  votes?: Record<string, string>;
}

export type EditableMemberProfile = Pick<
  MemberProfile,
  "name" | "major" | "class" | "gradYear" | "linkedIn" | "resumeLink"
>;
