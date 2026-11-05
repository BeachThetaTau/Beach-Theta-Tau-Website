interface MemberGridSkeletonProps {
  count?: number;
  label?: string;
}

/** Mirrors the grid columns, photo aspect ratio, name and subtitle lines. */
export function MemberGridSkeleton({
  count = 15,
  label = "Loading the member directory…",
}: MemberGridSkeletonProps) {
  return (
    <section className="container-page" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="mb-8 flex items-center gap-4" aria-hidden="true">
        <div className="h-7 w-28 animate-pulse rounded bg-panel" />
        <span className="h-px flex-1 bg-line" />
      </div>
      <div
        className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        aria-hidden="true"
      >
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="flex w-full animate-pulse flex-col">
            <div className="aspect-[3/4] rounded-lg bg-panel" />
            <div className="mt-3 h-5 w-3/4 rounded bg-panel" />
            <div className="mt-2 h-4 w-1/2 rounded bg-panel/70" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default MemberGridSkeleton;
