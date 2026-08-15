import type { MemberProfile } from "@beach-theta-tau/contracts";
import { MemberCard } from "../MemberCard/MemberCard";

interface OfficerSectionProps {
  title: string;
  members: MemberProfile[];
  onSelect: (member: MemberProfile) => void;
}

export function OfficerSection({ title, members, onSelect }: OfficerSectionProps) {
  if (!members.length) return null;
  return (
    <section className="container-page">
      <div className="mb-8 flex items-center gap-4">
        <h2 className="subsection-title whitespace-nowrap">{title}</h2>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {members.map((member) => (
          <MemberCard
            member={member}
            showPosition
            onSelect={onSelect}
            key={member.uid ?? member.name}
          />
        ))}
      </div>
    </section>
  );
}
