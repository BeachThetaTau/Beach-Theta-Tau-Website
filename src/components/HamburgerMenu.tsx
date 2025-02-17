import { useState } from "react";
import { Link } from "react-router-dom";
import "./HamburgerMenu.css";

interface User {
  email: string;
}

interface HamburgerMenuProps {
  user?: User; // The user prop is optional
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ user }) => {
  const [isActivated, setIsActivated] = useState(false);

  const toggleMenu = () => {
    setIsActivated(!isActivated);
  };

  const closeMenu = () => {
    setIsActivated(false);
  };

  return (
    <div className="hamburger-menu">
      <div className={`menu ${isActivated ? "menu_activated" : ""}`}>
        <nav id="main-menu" className="menu__nav">
          <ul className="menu__list ra-list">
            <li className="menu__group">
              <Link to="/" className="menu__link ra-link" onClick={closeMenu}>
                Home
              </Link>
            </li>
            <li className="menu__group">
              <Link
                to="/about"
                className="menu__link ra-link"
                onClick={closeMenu}
              >
                About
              </Link>
            </li>

            <li className="menu__group">
              <Link
                to="/brothers"
                className="menu__link ra-link"
                onClick={closeMenu}
              >
                Meet Us
              </Link>
            </li>

            <li className="menu__group">
              <Link
                to="/social"
                className="menu__link ra-link"
                onClick={closeMenu}
              >
                Social
              </Link>
            </li>
            <li className="menu__group">
              <Link
                to="/professionalism"
                className="menu__link ra-link"
                onClick={closeMenu}
              >
                Professionalism
              </Link>
            </li>
            <li className="menu__group">
              <Link
                to="/service"
                className="menu__link ra-link"
                onClick={closeMenu}
              >
                Service
              </Link>
            </li>
            <li className="menu__group">
              <Link
                to="/apply"
                className="menu__link ra-link"
                onClick={closeMenu}
              >
                Apply
              </Link>
            </li>
            <li className="menu__group">
              {user ? (
                <Link
                  to="/profile"
                  className="menu__link ra-link"
                  onClick={closeMenu}
                >
                  {user.email}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="menu__link ra-link"
                  onClick={closeMenu}
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
        <button
          className="menu__toggle ra-button"
          type="button"
          aria-controls="main-menu"
          onClick={toggleMenu}
        >
          <span className="menu__hamburger uia-hamburger">
            <span className="menu__hamburger-label uia-hamburger__label">
              <span className="menu__toggle-hint ha-screen-reader">
                Open menu
              </span>
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default HamburgerMenu;
