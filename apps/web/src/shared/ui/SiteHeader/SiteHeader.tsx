import { Link, NavLink } from "react-router-dom";
import Logo from "../Logo/Logo";
import OutlinedButton from "../OutlinedButton/OutlinedButton";
import { MobileNavigation } from "../MobileNavigation/MobileNavigation";

const navLinkBase =
  "relative m-0 inline-flex items-center py-1.5 text-sm font-medium text-muted no-underline transition-colors duration-150 hover:text-maroon";
const navLinkActive =
  "text-maroon font-semibold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-[1px] after:bg-maroon after:content-['']";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${navLinkBase} ${navLinkActive}` : navLinkBase;

const userLinkClass = ({ isActive }: { isActive: boolean }) =>
  `${isActive ? `${navLinkBase} ${navLinkActive}` : navLinkBase} font-semibold text-maroon`;

interface SiteHeaderProps {
  userEmail?: string | null;
}

export function SiteHeader({ userEmail }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-[1000] w-full border-b border-line bg-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur">
      <div className="container-page">
        <nav
          className="flex h-[4.5rem] items-center justify-between"
          aria-label="Primary navigation"
        >
          <Link to="/" aria-label="Theta Tau home" className="flex items-center no-underline">
            <Logo />
          </Link>

          <div className="flex items-center gap-6 max-[992px]:hidden">
            <NavLink to="/" className={linkClass} end>
              Home
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
            <NavLink to="/brothers" className={linkClass}>
              Meet Us
            </NavLink>
            <NavLink to="/social" className={linkClass}>
              Social
            </NavLink>
            <NavLink to="/professionalism" className={linkClass}>
              Professionalism
            </NavLink>
            <NavLink to="/service" className={linkClass}>
              Service
            </NavLink>
            <NavLink to="/apply" className="inline-flex items-center no-underline">
              <OutlinedButton text="Apply Now" />
            </NavLink>
            <span className="inline-block h-5 w-px bg-line" aria-hidden="true" />
            <NavLink to={userEmail ? "/profile" : "/login"} className={userLinkClass}>
              {userEmail ?? "Login"}
            </NavLink>
          </div>

          <MobileNavigation userEmail={userEmail} />
        </nav>
      </div>
    </header>
  );
}
