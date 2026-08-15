import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import "./MobileNavigation.css";

interface MobileNavigationProps {
  userEmail?: string | null;
}

const navLinks: ReadonlyArray<{ to: string; label: string; end?: boolean }> = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/brothers", label: "Meet Us" },
  { to: "/social", label: "Social" },
  { to: "/professionalism", label: "Professionalism" },
  { to: "/service", label: "Service" },
  { to: "/apply", label: "Apply" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "bmenu__link is-active" : "bmenu__link";

export function MobileNavigation({ userEmail }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Rendered through a portal so `position: fixed` resolves against the
  // viewport, not the SiteHeader (whose backdrop-blur would otherwise become
  // the containing block and pin the menu near the top of the page).
  return createPortal(
    <div className="hidden max-[992px]:block">
      <div className={`bmenu ${isOpen ? "bmenu_active" : ""}`}>
        <nav id="mobile-menu" className="bmenu__nav" aria-label="Mobile navigation">
          <ul className="bmenu__list">
            {navLinks.map(({ to, label, end }) => (
              <li key={to} className="bmenu__group">
                <NavLink to={to} className={linkClass} onClick={closeMenu} end={end}>
                  {label}
                </NavLink>
              </li>
            ))}
            <li className="bmenu__group">
              <NavLink
                to={userEmail ? "/profile" : "/login"}
                className={linkClass}
                onClick={closeMenu}
              >
                {userEmail ?? "Login"}
              </NavLink>
            </li>
          </ul>
        </nav>

        <button
          className="bmenu__toggle"
          type="button"
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={toggleMenu}
        >
          <span className="bmenu__ham">
            <span className="bmenu__ham-label">
              <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
            </span>
          </span>
        </button>
      </div>
    </div>,
    document.body,
  );
}
