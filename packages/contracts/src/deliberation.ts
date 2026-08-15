export const VOTE_CHOICES = ["yes", "abstain", "no"] as const;

export type VoteChoice = (typeof VOTE_CHOICES)[number];

export interface DeliberationCandidate {
  id: string;
  name: string;
  major?: string;
  gradYear?: string;
  events?: string[];
  image?: string;
  bidReceived?: boolean;
}

export interface VoteTotals {
  yes: number;
  no: number;
  abstain: number;
  total: number;
  yesPercent: number;
  noPercent: number;
  abstainPercent: number;
}

export interface CastVoteRequest {
  candidateId: string;
  vote: VoteChoice | null;
}

export interface SetActiveCandidateRequest {
  candidateId: string;
}

export interface SetBidStatusRequest {
  candidateId: string;
  bidReceived: boolean;
}
