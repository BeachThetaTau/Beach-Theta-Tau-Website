import type { DeliberationCandidate } from "@beach-theta-tau/contracts";
import { onCall } from "firebase-functions/v2/https";
import { adminDb } from "../shared/firebase-admin.js";
import { requireRole } from "../shared/require-role.js";
import { requireNonEmptyString } from "../shared/validation.js";

interface ImportCandidatesInput {
  candidates: DeliberationCandidate[];
}

export const importCandidates = onCall<ImportCandidatesInput>(async (request) => {
  requireRole(request, "admin");
  const candidates = Array.isArray(request.data.candidates) ? request.data.candidates : [];
  let batch = adminDb.batch();
  let operations = 0;

  for (const candidate of candidates) {
    const id = requireNonEmptyString(candidate.id, "candidate.id").toLowerCase();
    batch.set(
      adminDb.doc(`delibs/${id}`),
      {
        name: requireNonEmptyString(candidate.name, "candidate.name"),
        major: candidate.major ?? "",
        gradYear: candidate.gradYear ?? "",
        events: candidate.events ?? [],
        image: candidate.image ?? "",
        bidReceived: Boolean(candidate.bidReceived),
      },
      { merge: true },
    );
    operations += 1;
    if (operations >= 450) {
      await batch.commit();
      batch = adminDb.batch();
      operations = 0;
    }
  }

  if (operations) await batch.commit();
  return { imported: candidates.length };
});
