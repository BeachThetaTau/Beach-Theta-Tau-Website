import { useAuth } from "@/modules/auth";
import { LoadingState } from "@/shared/ui/LoadingState/LoadingState";
import AdminDashboard from "../components/AdminDashboard/AdminDashboard";
import MemberBallot from "../components/MemberBallot/MemberBallot";
import { useDelibsSession } from "../hooks/useDelibsSession";

export function DeliberationsPage({ adminOnly = false }: { adminOnly?: boolean }) {
  const { hasRole } = useAuth();
  const isAdmin = adminOnly || hasRole("admin");
  const { active, loading } = useDelibsSession();

  if (isAdmin) return <AdminDashboard />;

  if (loading) return <LoadingState label="Checking deliberations…" />;

  if (!active) {
    return (
      <section className="section section-muted min-h-[70vh]">
        <div className="container-narrow text-center">
          <p className="eyebrow">Deliberations</p>
          <h1 className="section-title">No active deliberations</h1>
          <p className="lead mx-auto mt-4 max-w-[40rem]">
            Voting isn&apos;t open right now. When an officer starts a deliberations session, a
            &ldquo;Cast your vote&rdquo; button appears on your profile and you&apos;ll be able to
            record your vote here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section section-muted min-h-[70vh]">
      <div className="container-narrow text-center">
        <p className="eyebrow">Deliberations</p>
        <h1 className="section-title">Cast Your Vote</h1>
        <p className="lead mx-auto mt-4 max-w-[40rem]">
          Review the candidate on the floor, then record your vote. Your choice updates live and can
          be changed until voting closes.
        </p>
      </div>
      <div className="container-page">
        <MemberBallot />
      </div>
    </section>
  );
}

export default DeliberationsPage;
