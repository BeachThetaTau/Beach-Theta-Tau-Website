import { useVoteResults } from "../../hooks/useVoteResults";

export function VoteResults({ candidateId }: { candidateId: string | null }) {
  const { totals, loading, error } = useVoteResults(candidateId);

  return (
    <div>
      <h3 className="mb-3 text-xl font-semibold text-ink">Live Vote Results</h3>
      {loading && <div className="italic text-muted">Loading votes…</div>}
      {error && <div className="italic text-muted">{error}</div>}
      {totals && !loading && (
        <div className="mt-5 rounded-lg border border-line bg-surface-soft p-4">
          <div className="mb-4">
            <div className="flex h-10 w-full overflow-hidden rounded-full shadow">
              <div
                className="flex items-center justify-center bg-[#228b22] text-sm font-bold text-white transition-all max-md:text-xs"
                style={{ width: `${totals.yesPercent}%` }}
              >
                {totals.yesPercent > 0 && (
                  <span className="[text-shadow:1px_1px_2px_rgba(0,0,0,0.5)]">
                    {totals.yesPercent}%
                  </span>
                )}
              </div>
              <div
                className="flex items-center justify-center bg-[#a52a2a] text-sm font-bold text-white transition-all max-md:text-xs"
                style={{ width: `${totals.noPercent}%` }}
              >
                {totals.noPercent > 0 && (
                  <span className="[text-shadow:1px_1px_2px_rgba(0,0,0,0.5)]">
                    {totals.noPercent}%
                  </span>
                )}
              </div>
              <div
                className="flex items-center justify-center bg-[#708090] text-sm font-bold text-white transition-all max-md:text-xs"
                style={{ width: `${totals.abstainPercent}%` }}
              >
                {totals.abstainPercent > 0 && (
                  <span className="[text-shadow:1px_1px_2px_rgba(0,0,0,0.5)]">
                    {totals.abstainPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap justify-center gap-5 max-md:gap-4">
            <div className="flex items-center gap-2 text-sm text-text max-md:text-xs">
              <span className="inline-block h-4 w-4 rounded-[2px] bg-[#228b22]" />
              Yes ({totals.yesPercent}%)
            </div>
            <div className="flex items-center gap-2 text-sm text-text max-md:text-xs">
              <span className="inline-block h-4 w-4 rounded-[2px] bg-[#a52a2a]" />
              No ({totals.noPercent}%)
            </div>
            <div className="flex items-center gap-2 text-sm text-text max-md:text-xs">
              <span className="inline-block h-4 w-4 rounded-[2px] bg-[#708090]" />
              Abstain ({totals.abstainPercent}%)
            </div>
          </div>
          <div className="text-center text-[13px] text-muted">
            <p className="my-1">
              Total Votes: {totals.total} | Yes: {totals.yes} | No: {totals.no} | Abstain:{" "}
              {totals.abstain}
            </p>
          </div>
        </div>
      )}
      {!totals && !loading && !error && <div className="italic text-muted">No votes found.</div>}
    </div>
  );
}
