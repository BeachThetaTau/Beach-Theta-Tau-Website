import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import DelibsClient from "../components/DelibsClient";
import DelibsMaster from "../components/DelibsMaster";

// Constants
const MASTER_UID = "AyYsNpskhxPOR40EMmJdMRAbqRj1";

const Delibs = () => {
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
        // Redirect to login if user is not authenticated
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If no user is authenticated, this will be handled by the redirect above
  // But we keep this as a fallback
  if (!uid) {
    return null;
  }

  // Render appropriate component based on user role
  return uid === MASTER_UID ? <DelibsMaster /> : <DelibsClient />;
};

export default Delibs;
