import type { DeliberationCandidate } from "@beach-theta-tau/contracts";
import { useEffect, useMemo, useState } from "react";
import { isoDate } from "@/shared/lib/dates";
import { EmptyState } from "@/shared/ui/EmptyState/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState/LoadingState";
import {
  candidatesToCsv,
  listCandidates,
  setActiveCandidate,
  setCandidateBidStatus,
} from "../../api/deliberations.repository";
import { CandidateCard } from "../CandidateCard/CandidateCard";
import { CandidateDetails } from "../CandidateDetails/CandidateDetails";
import { VoteResults } from "../VoteResults/VoteResults";

export function AdminDashboard() {
  const [candidates, setCandidates] = useState<DeliberationCandidate[]>([]);
  const [selected, setSelected] = useState<DeliberationCandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingBid, setLoadingBid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listCandidates()
      .then(setCandidates)
      .catch((nextError) => setError(nextError.message))
      .finally(() => setLoading(false));
  }, []);

  const sortedCandidates = useMemo(
    () => [...candidates].sort((left, right) => left.name.localeCompare(right.name)),
    [candidates],
  );

  const selectCandidate = async (candidate: DeliberationCandidate) => {
    setSelected(candidate);
    try {
      await setActiveCandidate(candidate.id);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Unable to set the active candidate.",
      );
    }
  };

  const toggleBid = async () => {
    if (!selected) return;
    const bidReceived = !selected.bidReceived;
    setLoadingBid(true);
    try {
      await setCandidateBidStatus(selected.id, bidReceived);
      const updated = { ...selected, bidReceived };
      setSelected(updated);
      setCandidates((current) =>
        current.map((candidate) => (candidate.id === updated.id ? updated : candidate)),
      );
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to update the bid status.");
    } finally {
      setLoadingBid(false);
    }
  };

  const downloadResults = () => {
    const url = URL.createObjectURL(
      new Blob([candidatesToCsv(candidates)], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `delibs_results_${isoDate()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const bidButtonClasses = [
    "min-w-[120px] cursor-pointer rounded-lg border-0 px-6 py-3 text-base font-semibold text-white shadow transition-all hover:-translate-y-px hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 max-md:w-full",
    loadingBid
      ? "bg-neutral-400 hover:translate-y-0 hover:shadow"
      : selected?.bidReceived
        ? "bg-[#228b22] hover:bg-[#1f7a1f]"
        : "bg-neutral-500 hover:bg-neutral-600",
  ].join(" ");

  if (loading) return <LoadingState label="Loading deliberation candidates…" />;
  if (error && candidates.length === 0)
    return <EmptyState title="Dashboard unavailable" description={error} />;

  return (
    <div className="mx-auto max-w-[1400px] p-5 max-[480px]:p-4">
      <div className="mb-8 flex items-center justify-between border-b-2 border-line pb-4 max-md:flex-col max-md:gap-4 max-md:text-center">
        <h1 className="m-0 text-[1.75rem] font-bold text-ink">Deliberation Candidates</h1>
        <div className="flex items-center gap-4 max-md:w-full max-md:flex-col max-md:items-stretch max-md:gap-2.5">
          <div className="rounded-sm bg-muted-surface px-3 py-1.5 text-sm font-medium text-ink max-md:text-center">
            Total Profiles: {candidates.length}
          </div>
          <button
            className="cursor-pointer rounded-sm border-0 bg-maroon px-5 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-maroon-dark disabled:cursor-not-allowed disabled:opacity-60 max-md:w-full max-md:text-center"
            type="button"
            onClick={downloadResults}
            disabled={!candidates.length}
          >
            Download Results
          </button>
        </div>
      </div>
      {error && (
        <p className="my-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 py-5 max-md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] max-md:gap-4 max-[480px]:grid-cols-1">
        {sortedCandidates.map((candidate) => (
          <CandidateCard
            candidate={candidate}
            onSelect={(item) => void selectCandidate(item)}
            key={candidate.id}
          />
        ))}
      </div>
      {!candidates.length && (
        <div className="p-10 text-center italic text-muted">
          No profiles found in the delibs collection.
        </div>
      )}
      {selected && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-5 max-[480px]:p-2.5"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <div
            className="relative h-[820px] w-[1240px] max-h-[calc(100vh-40px)] max-w-[calc(100vw-40px)] overflow-hidden rounded-3xl bg-white shadow-elevated max-md:m-2.5 max-md:h-[calc(100vh-20px)] max-md:w-full"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="absolute right-4 top-4 z-[1001] flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent text-2xl text-muted transition-colors hover:bg-black/20"
              type="button"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <div className="flex h-full flex-row overflow-y-auto overflow-x-hidden rounded-3xl max-md:flex-col">
              <CandidateDetails candidate={selected} />
              <div className="flex min-w-0 flex-1 flex-col gap-6 rounded-r-3xl bg-white p-8 max-md:p-6">
                <h2 className="m-0 text-3xl font-bold leading-tight text-ink max-md:text-2xl">
                  {selected.name}
                </h2>
                <div>
                  <button
                    className={bidButtonClasses}
                    type="button"
                    onClick={() => void toggleBid()}
                    disabled={loadingBid}
                  >
                    {loadingBid ? "Updating…" : selected.bidReceived ? "Bid Received" : "Give Bid"}
                  </button>
                </div>
                <VoteResults candidateId={selected.id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
