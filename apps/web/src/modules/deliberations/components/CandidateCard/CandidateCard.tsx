import type { DeliberationCandidate } from "@beach-theta-tau/contracts";
import { assetUrl } from "@/shared/lib/assets";
import { googleDriveThumbnail } from "@/shared/lib/urls";

interface CandidateCardProps {
  candidate: DeliberationCandidate;
  onSelect: (candidate: DeliberationCandidate) => void;
}

export function CandidateCard({ candidate, onSelect }: CandidateCardProps) {
  return (
    <button
      type="button"
      className="flex cursor-pointer flex-col overflow-hidden rounded-md border border-line bg-white p-0 text-left shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-elevated"
      onClick={() => onSelect(candidate)}
    >
      <div className="relative flex h-[250px] w-full items-center justify-center overflow-hidden bg-surface-soft max-md:h-[220px]">
        {candidate.image ? (
          <img
            src={googleDriveThumbnail(candidate.image, 400)}
            alt={`Profile of ${candidate.name}`}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              const sibling = event.currentTarget.nextElementSibling as HTMLElement | null;
              if (sibling) sibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand to-maroon font-medium text-white ${candidate.image ? "hidden" : ""}`}
        >
          <span>No Image</span>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center gap-1 px-5 py-4">
        <span className="text-lg font-semibold text-ink">{candidate.name || "Unknown"}</span>
        {candidate.bidReceived && (
          <img className="h-4 w-4" src={assetUrl("check.png")} alt="Bid received" />
        )}
      </div>
    </button>
  );
}
