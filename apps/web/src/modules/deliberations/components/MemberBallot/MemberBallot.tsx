import { googleDriveThumbnail } from "@/shared/lib/urls";
import { EmptyState } from "@/shared/ui/EmptyState/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState/LoadingState";
import { useBallot } from "../../hooks/useBallot";
import { VoteControls } from "../VoteControls/VoteControls";

const cardClasses =
  "mx-auto mt-6 w-full max-w-[500px] rounded-2xl border border-line bg-surface-soft p-6 shadow-md md:mt-10 md:p-10 xl:max-w-[600px] xl:p-12";

export function MemberBallot() {
  const ballot = useBallot();

  if (ballot.loading) return <LoadingState label="Loading the active candidate…" />;
  if (ballot.error) return <EmptyState title="Ballot unavailable" description={ballot.error} />;
  if (!ballot.candidate) {
    return (
      <EmptyState
        title="No active candidate"
        description="An administrator has not selected a candidate yet."
      />
    );
  }

  const candidate = ballot.candidate;
  return (
    <>
      <div className={cardClasses}>
        <div className="flex flex-col items-center gap-4 text-center md:gap-6">
          <div className="relative aspect-[3/4] w-full max-w-[280px] md:max-w-[350px] xl:max-w-[400px]">
            {candidate.image ? (
              <img
                src={googleDriveThumbnail(candidate.image, 600)}
                alt={`Profile of ${candidate.name}`}
                className="h-full w-full rounded-xl object-cover shadow-lg"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-brand to-maroon text-6xl text-white shadow-lg"
                aria-hidden="true"
              >
                👤
              </div>
            )}
          </div>
          <h2 className="m-0 text-2xl font-bold leading-tight tracking-tight text-ink md:text-[28px]">
            {candidate.name}
          </h2>
          <div className="rounded-full bg-gradient-to-br from-brand to-maroon px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-md md:text-base">
            {candidate.major}
          </div>
          <div className="text-sm font-medium text-muted md:text-base">
            <strong className="text-ink">Graduation:</strong> {candidate.gradYear}
          </div>
          {candidate.events?.length ? (
            <div className="mt-2 w-full">
              <h3 className="mb-4 text-center text-lg font-bold text-ink">Events</h3>
              <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                {candidate.events.map((event) => (
                  <div
                    className="mt-4 rounded-2xl border border-line bg-muted-surface px-3 py-1.5 text-sm font-medium text-muted md:px-5 md:py-4"
                    key={event}
                  >
                    {event}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full p-5 text-center italic text-muted">No events listed</div>
          )}
        </div>
      </div>
      <div className={cardClasses}>
        <VoteControls
          currentVote={ballot.currentVote}
          disabled={ballot.saving}
          onVote={(choice) => void ballot.vote(choice)}
        />
      </div>
    </>
  );
}

export default MemberBallot;
