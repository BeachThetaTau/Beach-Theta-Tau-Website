import { useState } from "react";
import { Link } from "react-router-dom";
import { clearAllDeliberationsData } from "@/modules/deliberations";
import { Modal } from "@/shared/ui/Modal/Modal";
import { AdminMembersPanel } from "../components/AdminMembersPanel/AdminMembersPanel";

export function AdminPanelPage() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [membersRefreshKey, setMembersRefreshKey] = useState(0);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setAlert(null);
    try {
      const result = await clearAllDeliberationsData();
      setAlert({
        type: "success",
        message: `Successfully deleted ${result.deletedCandidatesCount} deliberation ${
          result.deletedCandidatesCount === 1 ? "candidate" : "candidates"
        } and cleared votes for ${result.clearedUsersCount} ${
          result.clearedUsersCount === 1 ? "member" : "members"
        }.`,
      });
      setMembersRefreshKey((prev) => prev + 1);
      setIsConfirmOpen(false);
    } catch (err) {
      setAlert({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to delete deliberations entries and votes.",
      });
    } finally {
      setDeleting(false);
    }
  };

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
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                title="Delete all deliberation candidate entries and clear all votes"
              >
                <IconTrash className="h-4 w-4" />
                <span>Delete all entries & votes</span>
              </button>
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
          </div>

          {alert && (
            <div
              className={`mt-5 flex items-center justify-between gap-3 rounded-xl border p-4 text-sm font-medium ${
                alert.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
              role="alert"
            >
              <span>{alert.message}</span>
              <button
                type="button"
                onClick={() => setAlert(null)}
                className="text-xs font-semibold underline hover:opacity-80"
              >
                Dismiss
              </button>
            </div>
          )}
        </section>

        <AdminMembersPanel refreshKey={membersRefreshKey} />
      </div>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => !deleting && setIsConfirmOpen(false)}
        ariaLabel="Confirm deletion of deliberation entries and votes"
      >
        <div className="w-[min(90vw,32rem)]">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600">
              <IconAlertTriangle className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-ink">Delete all deliberations & votes?</h3>
              <p className="mt-2 text-sm text-muted">
                Are you sure you want to proceed? This will permanently wipe all deliberation data across the chapter:
              </p>
            </div>
          </div>

          <ul className="mt-4 space-y-2 rounded-xl bg-surface-soft p-4 text-sm text-ink">
            <li className="flex items-center gap-2">
              <span className="font-bold text-red-500">•</span>
              <span>All candidate profiles in the deliberations board will be deleted.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold text-red-500">•</span>
              <span>All votes cast by members will be reset.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold text-red-500">•</span>
              <span>The active deliberation candidate selection and live session will be closed.</span>
            </li>
          </ul>

          <p className="mt-3 text-xs font-semibold text-red-700">
            ⚠️ This action is permanent and cannot be undone.
          </p>

          <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setIsConfirmOpen(false)}
              disabled={deleting}
              className="rounded-full border border-line px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-muted-surface disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-full border border-transparent bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconTrash className="h-4 w-4" />
              <span>{deleting ? "Deleting…" : "Yes, delete everything"}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function IconTrash({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function IconAlertTriangle({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default AdminPanelPage;


