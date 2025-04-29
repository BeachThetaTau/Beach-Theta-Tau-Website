import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const db = getFirestore();
  const user = auth.currentUser;

  const logoutUser = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed: ", error);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          const defaultData = {
            name: "",
            major: "",
            class: "",
            gradYear: "",
            linkedIn: "",
            resumeLink: "",
            email: user.email || "",
            verified: false,
            copied: false,
          };
          await setDoc(userDocRef, defaultData);
          setUserData(defaultData);
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error fetching or creating user data: ", error);
      }
    };

    fetchUserData();
  }, [user, db, navigate]);

  const handleEditClick = () => {
    setEditedData(userData);
    setValidationErrors([]);
    setIsEditing(true);
  };

  const handleInputChange = (field, value) => {
    setEditedData((prevData) => ({ ...prevData, [field]: value }));
  };

  // Helper function to convert a string to title case
  const toTitleCase = (str) => {
    return str
      .split(" ")
      .filter((word) => word.length > 0)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Helper function to clean the input data
  const cleanData = (data) => {
    const cleaned = {};
    for (const key in data) {
      let value = data[key];
      if (typeof value === "string") {
        // Always trim whitespace
        value = value.trim();
        // For the "class" field, remove trailing " class"
        if (key === "class") {
          if (value.toLowerCase().endsWith(" class")) {
            value = value.substring(0, value.length - " class".length).trim();
          }
        }
        // For the "major" field, convert trailing " engineer" to " engineering"
        if (key === "major") {
          if (value.toLowerCase().endsWith(" engineer")) {
            value =
              value.substring(0, value.length - " engineer".length).trim() +
              " engineering";
          }
        }
        // For "major" and "class", convert to title case
        if (key === "major" || key === "class") {
          value = toTitleCase(value);
        }
      }
      cleaned[key] = value;
    }
    return cleaned;
  };

  // Updated validateData to accept data as a parameter
  const validateData = (data) => {
    const errors = [];

    if (!data.name || data.name.trim() === "") {
      errors.push("Name is required.");
    }

    if (data.gradYear && isNaN(data.gradYear)) {
      errors.push("Graduation year must be a number.");
    }

    // Validate resumeLink URL: must start with "https://" and contain ".com"
    if (data.resumeLink) {
      if (
        !data.resumeLink.startsWith("https://") ||
        !data.resumeLink.includes(".com")
      ) {
        errors.push(
          "Resume link must start with 'https://' and include '.com'."
        );
      }
    }

    // Validate linkedIn URL: must start with "https://" and contain ".com"
    if (data.linkedIn) {
      if (
        !data.linkedIn.startsWith("https://") ||
        !data.linkedIn.includes(".com")
      ) {
        errors.push(
          "LinkedIn link must start with 'https://' and include '.com'."
        );
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    // Clean the edited data before validation and saving.
    const cleanedData = cleanData(editedData);

    if (!validateData(cleanedData)) return;

    setIsLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const updatedData = {
        ...cleanedData,
        email: user.email || "",
        verified: false,
        copied: false,
      };
      await updateDoc(userDocRef, updatedData);
      setUserData(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setValidationErrors([]);
    setIsEditing(false);
  };

  const getPfpPath = () => {
    if (userData?.verified) {
      const name = userData.name
        ? userData.name.replace(/[^a-zA-Z]/g, "").toLowerCase()
        : "blankpfp";
      return `/Brothers/${name}.webp`;
    }
    return "/Brothers/blankpfp.webp";
  };

  const pfpPath = getPfpPath();

  // Helper to truncate URL strings to 35 characters
  const truncateUrl = (url) => {
    if (!url) return "N/A";
    return url.length > 35 ? url.slice(0, 35) + "..." : url;
  };

  // Render the field value; if the field is a URL, truncate it.
  const renderFieldValue = (field) => {
    const value = userData?.[field];
    if (!value) return "N/A";
    if (field === "linkedIn" || field === "resumeLink") {
      return truncateUrl(value);
    }
    return value;
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="user-container">
        <img
          className="pfp"
          src={pfpPath}
          alt="profile picture"
          aria-label="User profile picture"
        />
        <button
          type="button"
          className="logout"
          onClick={logoutUser}
          aria-label="Logout button"
        >
          Logout
        </button>
      </div>
      
      <div className="user-info">
      <Link id = "retreat" to="/retreat">🎉 Retreat Game 🏝️</Link>
        {["name", "major", "class", "gradYear", "linkedIn", "resumeLink"].map(
          (field) => (
            <div className="info-field" key={field}>
              <p className="label">
                {field === "gradYear"
                  ? "Graduation Year:"
                  : field === "resumeLink"
                    ? "Resume Link:"
                    : field === "linkedIn"
                      ? "LinkedIn:"
                      : `${field.charAt(0).toUpperCase() + field.slice(1)}:`}
              </p>
              {isEditing ? (
                <input
                  type="text"
                  className="user-input"
                  value={editedData[field] || ""}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  aria-label={`Edit ${field}`}
                />
              ) : (
                <p className="user-data">{renderFieldValue(field)}</p>
              )}
            </div>
          )
        )}

        {isEditing && (
          <>
            <div className="button-group">
              <button
                className="save"
                onClick={handleSave}
                disabled={isLoading}
                aria-label="Save button"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
              <button
                className="cancel"
                onClick={handleCancel}
                disabled={isLoading}
                aria-label="Cancel button"
              >
                Cancel
              </button>
            </div>

            {validationErrors.length > 0 && (
              <div className="error-messages">
                {validationErrors.map((error, index) => (
                  <p key={index} className="error-text">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </>
        )}

        {!isEditing && (
          <div className="edit-container">
            <button
              className="edit"
              onClick={handleEditClick}
              aria-label="Edit profile button"
            >
              Edit Profile <img id="EditIcon" src="edit.png" alt="edit" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
