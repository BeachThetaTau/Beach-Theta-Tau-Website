import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth";
import { setDelibsSessionActive, useDelibsSession } from "@/modules/deliberations";

const primaryButton =
  "w-full rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-maroon-dark disabled:cursor-not-allowed disabled:opacity-50";
const outlineButton =
  "w-full rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-maroon transition-colors hover:border-maroon hover:bg-maroon hover:text-white disabled:cursor-not-allowed disabled:opacity-50";
const dangerButton =
  "w-full rounded-full border border-[#a52a2a] px-5 py-2.5 text-sm font-semibold text-[#a52a2a] transition-colors hover:bg-[#a52a2a] hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

export function DelibsProfileActions() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const { active, loading } = useDelibsSession();
  const [pending, setPending] = useState(false);

  async function toggle(next: boolean) {
    setPending(true);
    try {
      await setDelibsSessionActive(next);
      if (next) navigate("/delibs");
    } catch (error) {
      console.error("Failed to update deliberations session", error);
    } finally {
      setPending(false);
    }
  }

  // Avoid a flash of the wrong control before the live status resolves.
  if (loading) return null;

  if (isAdmin) {
    return (
      <div className="w-full rounded-xl border border-line bg-white p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Deliberations</p>
        {active ? (
          <>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#228b22]">
              <span className="h-2 w-2 rounded-full bg-[#228b22]" aria-hidden="true" />
              Session is live
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <button type="button" className={outlineButton} onClick={() => navigate("/delibs")}>
                Open deliberations board
              </button>
              <button
                type="button"
                className={dangerButton}
                disabled={pending}
                onClick={() => void toggle(false)}
              >
                {pending ? "Ending…" : "End delibs"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">
              Start a session to open voting for all members.
            </p>
            <button
              type="button"
              className={`${primaryButton} mt-3`}
              disabled={pending}
              onClick={() => void toggle(true)}
            >
              {pending ? "Starting…" : "Start delibs"}
            </button>
          </>
        )}
      </div>
    );
  }

  // Members only see a way in while a session is live.
  if (!active) return null;

  return (
    <button type="button" className={primaryButton} onClick={() => navigate("/delibs")}>
      Cast your vote
    </button>
  );
}

export default DelibsProfileActions;
