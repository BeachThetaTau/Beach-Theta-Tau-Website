import { Link } from "react-router-dom";
import { AdminMembersPanel } from "../components/AdminMembersPanel/AdminMembersPanel";

export function AdminPanelPage() {
  return (
    <div className="section">
      <div className="container-page flex flex-col gap-10">
        <header>
          <p className="eyebrow">Admin</p>
          <h1 className="section-title mt-1">Admin panel</h1>
          <span className="accent-bar mt-4 block" />
          <p className="lead mt-4 max-w-2xl">Start deliberations and manage member records.</p>
        </header>

        <section className="panel overflow-hidden p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-maroon/10 text-maroon"
                aria-hidden="true"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12h6" />
                  <path d="M9 16h6" />
                  <path d="M9 8h6" />
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                </svg>
              </span>
              <div>
                <h2 className="subsection-title">Deliberations</h2>
                <p className="mt-1 max-w-md text-sm text-muted">
                  Open the deliberations board to select the active candidate and run voting.
                </p>
              </div>
            </div>
            <Link
              to="/delibs"
              className="inline-flex items-center gap-2 rounded-full bg-maroon px-6 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition-colors hover:bg-maroon-dark"
            >
              Start delibs
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        <AdminMembersPanel />
      </div>
    </div>
  );
}

export default AdminPanelPage;
