import type { SetBidStatusRequest } from "@beach-theta-tau/contracts";
import { onCall } from "firebase-functions/v2/https";
import { adminDb } from "../shared/firebase-admin.js";
import { requireRole } from "../shared/require-role.js";
import { requireBoolean, requireNonEmptyString } from "../shared/validation.js";

export const setBidStatus = onCall<SetBidStatusRequest>(async (request) => {
  requireRole(request, "admin");
  const candidateId = requireNonEmptyString(request.data.candidateId, "candidateId");
  const bidReceived = requireBoolean(request.data.bidReceived, "bidReceived");
  await adminDb.doc(`delibs/${candidateId}`).update({ bidReceived });
  return { candidateId, bidReceived };
});
