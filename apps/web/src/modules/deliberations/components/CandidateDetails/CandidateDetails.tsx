import type { DeliberationCandidate } from "@beach-theta-tau/contracts";
import { googleDriveThumbnail } from "@/shared/lib/urls";

export function CandidateDetails({ candidate }: { candidate: DeliberationCandidate }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-l-3xl bg-surface-soft max-md:h-[320px] max-md:flex-none max-md:rounded-l-none max-md:rounded-t-3xl">
        <div className="relative h-full w-full">
          {candidate.image ? (
            <img
              src={googleDriveThumbnail(candidate.image, 600)}
              alt={`Profile of ${candidate.name}`}
              className="h-full w-full object-contain"
            />
          ) : null}
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-maroon text-lg font-medium text-white ${candidate.image ? "hidden" : ""}`}
          >
            <span>No Image</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-8 max-md:p-6">
        <div className="flex gap-3">
          <span className="font-semibold text-ink">Major:</span>
          <span className="text-muted">{candidate.major || "Not specified"}</span>
        </div>
        <div className="flex gap-3">
          <span className="font-semibold text-ink">Graduation Year:</span>
          <span className="text-muted">{candidate.gradYear || "Not specified"}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-8 pt-0 max-md:p-6 max-md:pt-0">
        <h3 className="text-xl font-semibold text-ink">Events:</h3>
        <div className="flex flex-wrap gap-2">
          {candidate.events?.length ? (
            candidate.events.map((event) => (
              <span
                className="rounded-2xl border border-line bg-muted-surface px-3 py-1.5 text-sm font-medium text-muted"
                key={event}
              >
                {event}
              </span>
            ))
          ) : (
            <span className="italic text-muted">No events listed</span>
          )}
        </div>
      </div>
    </div>
  );
}
