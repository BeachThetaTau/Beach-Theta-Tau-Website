import type { MemberProfile } from "@beach-theta-tau/contracts";
import { useMemo } from "react";
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";
import { greekAlphabetOrder, groupMembersByClass } from "../../utils/member-sorting";
import { MemberCard } from "../MemberCard/MemberCard";

interface MemberGridProps {
  members: MemberProfile[];
  onSelect: (member: MemberProfile) => void;
}

interface FlatEntry {
  letter: string;
  member: MemberProfile;
}

interface ClassSection {
  letter: string;
  members: MemberProfile[];
}

export function MemberGrid({ members, onSelect }: MemberGridProps) {
  // Flatten into a single ordered list (newest class first, members A–Z within
  // a class) so we can reveal them incrementally while still drawing per-class
  // headers when a section becomes visible.
  const ordered = useMemo<FlatEntry[]>(() => {
    const grouped = groupMembersByClass(members);
    return greekAlphabetOrder.flatMap((letter) =>
      (grouped[letter] ?? []).map((member) => ({ letter, member })),
    );
  }, [members]);

  const { visibleCount, hasMore, loadMore, sentinelRef } = useInfiniteScroll(ordered.length, {
    initial: 40,
    pageSize: 40,
  });

  // Regroup only the currently visible slice back into contiguous class
  // sections for rendering.
  const sections = useMemo<ClassSection[]>(() => {
    const result: ClassSection[] = [];
    for (const { letter, member } of ordered.slice(0, visibleCount)) {
      const last = result[result.length - 1];
      if (last && last.letter === letter) last.members.push(member);
      else result.push({ letter, members: [member] });
    }
    return result;
  }, [ordered, visibleCount]);

  return (
    <div className="flex flex-col gap-16">
      {sections.map((section) => (
        <section key={section.letter} className="container-page">
          <div className="mb-8 flex items-center gap-4">
            <h2 className="subsection-title whitespace-nowrap">{section.letter}</h2>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {section.members.map((member) => (
              <MemberCard member={member} onSelect={onSelect} key={member.uid ?? member.name} />
            ))}
          </div>
        </section>
      ))}

      {ordered.length > 0 && (
        <div className="container-page flex flex-col items-center gap-4">
          {/* Auto-load trigger: revealed as the user nears the end of the list. */}
          <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
          {hasMore ? (
            <>
              <button
                type="button"
                onClick={loadMore}
                className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-maroon transition-colors hover:border-maroon hover:bg-maroon hover:text-white"
              >
                Load more brothers
              </button>
              <p className="text-sm text-muted" aria-live="polite">
                Showing {Math.min(visibleCount, ordered.length)} of {ordered.length}
              </p>
            </>
          ) : (
            ordered.length > 40 && (
              <p className="text-sm text-muted" aria-live="polite">
                All {ordered.length} brothers loaded
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default MemberGrid;
