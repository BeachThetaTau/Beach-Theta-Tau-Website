import type { DeliberationCandidate } from "@beach-theta-tau/contracts";
import { onCall } from "firebase-functions/v2/https";
import { adminDb } from "../shared/firebase-admin.js";
import { requireRole } from "../shared/require-role.js";

const escape = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

export const exportResults = onCall(async (request) => {
  requireRole(request, "admin");
  const snapshot = await adminDb.collection("delibs").get();
  const candidates: DeliberationCandidate[] = snapshot.docs.map((candidateDocument) => ({
    ...(candidateDocument.data() as Omit<DeliberationCandidate, "id">),
    id: candidateDocument.id,
  }));
  const rows = candidates
    .sort((left, right) =>
      left.bidReceived === right.bidReceived
        ? left.name.localeCompare(right.name)
        : left.bidReceived
          ? -1
          : 1,
    )
    .map((candidate) => [candidate.name, candidate.id, candidate.bidReceived ? "Yes" : "No"]);
  const csv = [["Name", "Email", "Bid Received"], ...rows]
    .map((row) => row.map((value) => escape(String(value))).join(","))
    .join("\n");
  return { csv };
});
