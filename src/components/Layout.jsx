import { Outlet } from "react-router-dom";
import "./NavBar.css";
import OutlinedButton from "./OutlinedButton";
import DisplayLogo from "./Logo";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import HamburgerMenu from "../components/HamburgerMenu";
import Footer from "../components/Footer";
import CopyUsersComponent from "../components/CopyUsersComponent";

const Layout = () => {
  const navigate = useNavigate();
  // Update: Use useState to manage the user state locally
  const [user, setUser] = useState(null); // Initialize user state as null

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, update the user state
        setUser(user);
        console.log("uid", user.uid);
      } else {
        // User is signed out, set user state to null
        setUser(null);
        console.log("user is logged out");
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  const logoutUser = async (e) => {
    e.preventDefault();
    await signOut(auth); // Sign out the current user
    navigate("/"); // Navigate to the homepage or login page as needed
  };

  return (
    <>
      <CopyUsersComponent />
      <div className="container-fluid">
        <HamburgerMenu user={user} />
        <div className="row justify-content-center">
          <div className="navbar-container">
            <nav className="navbar">
              <div className="logo">
                <Link to="">
                  <DisplayLogo />
                </Link>
              </div>

              <div className="links">
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/brothers">Meet Us</Link>
                <Link to="/social">Social</Link>
                <Link to="/professionalism">Professionalism</Link>
                <Link to="/service">Service</Link>
                <Link to="/apply">
                  <OutlinedButton text="Apply Now" />
                </Link>
                <a className="nav-line"></a>
                {user ? (
                  <Link to="/profile">{user.email}</Link>
                ) : (
                  <Link to="/login">Login</Link>
                )}
              </div>
            </nav>
          </div>
          <Outlet />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Layout;
