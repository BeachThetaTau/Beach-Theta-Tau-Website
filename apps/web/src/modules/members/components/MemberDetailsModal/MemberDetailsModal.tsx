import type { MemberProfile } from "@beach-theta-tau/contracts";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { assetUrl } from "@/shared/lib/assets";
import Modal from "@/shared/ui/Modal/Modal";
import { memberPhotoUrl } from "../../utils/member-sorting";

interface MemberDetailsModalProps {
  member: MemberProfile | null;
  onClose: () => void;
}

export function MemberDetailsModal({ member, onClose }: MemberDetailsModalProps) {
  const fallback = assetUrl("Brothers/blank-pfp.webp");

  return (
    <Modal isOpen={Boolean(member)} onClose={onClose} ariaLabel="Member details">
      {member && (
        <div className="w-[min(90vw,44rem)]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close member details"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-2xl leading-none text-muted transition-colors hover:bg-surface-soft hover:text-ink"
          >
            &times;
          </button>

          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-7 sm:text-left">
            <div className="w-64 flex-none sm:w-72">
              <div className="overflow-hidden rounded-lg shadow-card">
                <LazyLoadImage
                  effect="blur"
                  className="aspect-[3/4] w-full object-cover"
                  src={assetUrl(memberPhotoUrl(member)) || fallback}
                  onError={(event) => {
                    event.currentTarget.src = fallback;
                  }}
                  alt={`${member.name}'s profile`}
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-tight text-ink">{member.name}</h2>
              {member.position && (
                <span className="mt-2 inline-block rounded-full bg-panel px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand">
                  {member.position}
                </span>
              )}

              <span className="accent-bar mx-auto mt-4 block sm:mx-0" />

              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Major
                  </dt>
                  <dd className="m-0 mt-0.5 text-base text-text">{member.major || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Graduation Year
                  </dt>
                  <dd className="m-0 mt-0.5 text-base text-text">{member.gradYear || "N/A"}</dd>
                </div>
              </dl>

              {(member.linkedIn || member.resumeLink) && (
                <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
                  {member.linkedIn && (
                    <a
                      href={member.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-full border-2 border-[#0072b1] bg-white px-4 py-1.5 text-sm font-bold text-[#0072b1] no-underline transition-colors duration-300 hover:bg-[#0072b1] hover:text-white"
                    >
                      <span>LinkedIn</span>
                      <FontAwesomeIcon icon={faLinkedin} className="text-lg" />
                    </a>
                  )}
                  {member.resumeLink && (
                    <a
                      href={member.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-full border-2 border-brand bg-white px-4 py-1.5 text-sm font-bold text-brand no-underline transition-colors duration-300 hover:bg-brand hover:text-white"
                    >
                      <span>Resume</span>
                      <FontAwesomeIcon icon={faFile} className="text-lg" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default MemberDetailsModal;
