import type { SetActiveCandidateRequest } from "@beach-theta-tau/contracts";
import { onCall } from "firebase-functions/v2/https";
import { adminDb } from "../shared/firebase-admin.js";
import { requireRole } from "../shared/require-role.js";
import { requireNonEmptyString } from "../shared/validation.js";

export const setActiveCandidate = onCall<SetActiveCandidateRequest>(async (request) => {
  requireRole(request, "admin");
  const candidateId = requireNonEmptyString(request.data.candidateId, "candidateId");
  await adminDb.doc("selectedDelib/current").set({ selectedDelib: candidateId }, { merge: true });
  return { candidateId };
});
