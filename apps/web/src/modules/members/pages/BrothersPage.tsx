import type { MemberProfile } from "@beach-theta-tau/contracts";
import { useMemo, useState } from "react";
import "react-lazy-load-image-component/src/effects/blur.css";
import PageHero from "@/shared/ui/PageHero/PageHero";
import { EmptyState } from "@/shared/ui/EmptyState/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState/LoadingState";
import { MemberDetailsModal } from "../components/MemberDetailsModal/MemberDetailsModal";
import { MemberDirectoryFilters } from "../components/MemberDirectoryFilters/MemberDirectoryFilters";
import { MemberGrid } from "../components/MemberGrid/MemberGrid";
import { OfficerSection } from "../components/OfficerSection/OfficerSection";
import { useMembers } from "../hooks/useMembers";
import { splitOfficers } from "../utils/member-sorting";

export function BrothersPage() {
  const { members, loading, error } = useMembers();
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [showOfficers, setShowOfficers] = useState(false);
  const { executiveBoard, chairs } = useMemo(() => splitOfficers(members), [members]);

  return (
    <>
      <PageHero
        fileName={showOfficers ? "Eboard2.JPG" : "Brothers.jpg"}
        title={showOfficers ? "Meet the Executive Board" : "Meet the Brothers"}
        eyebrow="Xi Epsilon"
      />
      <section className="section">
        <div className="container-page">
          <MemberDirectoryFilters showingOfficers={showOfficers} onChange={setShowOfficers} />
        </div>

        <div className="mt-12">
          {loading && <LoadingState label="Loading the member directory…" />}
          {error && <EmptyState title="Member directory unavailable" description={error} />}
          {!loading && !error && members.length === 0 && (
            <EmptyState
              title="No members found"
              description="No verified profiles are available yet."
            />
          )}
          {!loading &&
            !error &&
            members.length > 0 &&
            (showOfficers ? (
              <div className="flex flex-col gap-16">
                <OfficerSection
                  title="Executive Board"
                  members={executiveBoard}
                  onSelect={setSelectedMember}
                />
                <OfficerSection
                  title="Committee Chairs"
                  members={chairs}
                  onSelect={setSelectedMember}
                />
              </div>
            ) : (
              <MemberGrid members={members} onSelect={setSelectedMember} />
            ))}
        </div>
      </section>
      <MemberDetailsModal member={selectedMember} onClose={() => setSelectedMember(null)} />
    </>
  );
}

export default BrothersPage;
