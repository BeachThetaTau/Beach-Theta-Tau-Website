import type { MemberProfile } from "@beach-theta-tau/contracts";
import { useMemo } from "react";
import { greekAlphabetOrder, groupMembersByClass } from "../../utils/member-sorting";
import { MemberCard } from "../MemberCard/MemberCard";

interface MemberGridProps {
  members: MemberProfile[];
  onSelect: (member: MemberProfile) => void;
}

/**
 * Fetch grid thumbnails up front for this chapter-sized roster. Switch to "lazy" to defer
 * offscreen photos until they near the viewport; compare the two on mobile.
 */
const PHOTO_LOADING: "eager" | "lazy" = "eager";

/** Photos in the first few rows also get a high fetch priority. */
const HIGH_PRIORITY_PHOTO_COUNT = 10;

export function MemberGrid({ members, onSelect }: MemberGridProps) {
  // Newest class first, members A–Z within a class. Every class renders at once.
  const sections = useMemo(() => {
    const grouped = groupMembersByClass(members);
    return greekAlphabetOrder
      .map((letter) => ({ letter, members: grouped[letter] ?? [] }))
      .filter((section) => section.members.length > 0);
  }, [members]);

  return (
    <div className="flex flex-col gap-16">
      {sections.map((section, sectionIndex) => (
        <section key={section.letter} className="container-page">
          <div className="mb-8 flex items-center gap-4">
            <h2 className="subsection-title whitespace-nowrap">{section.letter}</h2>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {section.members.map((member, memberIndex) => (
              <MemberCard
                member={member}
                loading={PHOTO_LOADING}
                highPriority={sectionIndex === 0 && memberIndex < HIGH_PRIORITY_PHOTO_COUNT}
                onSelect={onSelect}
                key={member.uid ?? member.name}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default MemberGrid;
