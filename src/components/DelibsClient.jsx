import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./DelibsClient.css";

const DelibsClient = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [delibsCache, setDelibsCache] = useState(null);
  const [selectedDelibUserId, setSelectedDelibUserId] = useState(null); // Changed from selectedDelibValue to selectedDelibUserId
  const [userDoc, setUserDoc] = useState(null);
  const [currentVote, setCurrentVote] = useState(null);

  const db = useMemo(() => getFirestore(), []);
  const auth = useMemo(() => getAuth(), []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        await Promise.all([
          cacheDelibsCollection(),
          fetchUserDocument(currentUser.uid),
        ]);
        setupSelectedDelibListener();
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  const setupSelectedDelibListener = () =>
    onSnapshot(collection(db, "selectedDelib"), (querySnapshot) => {
      const selectedDelibUserId = // Changed variable name
        querySnapshot.docs[0]?.data()?.selectedDelib || null; // This now contains user ID
      setSelectedDelibUserId(selectedDelibUserId); // Updated state setter
    });

  useEffect(() => {
    if (selectedDelibUserId && userDoc?.votes) {
      // Updated condition
      setCurrentVote(userDoc.votes[selectedDelibUserId] || null); // Now using user ID as key
    } else {
      setCurrentVote(null);
    }
  }, [selectedDelibUserId, userDoc]); // Updated dependency

  const fetchUserDocument = async (uid) => {
    const userDocSnapshot = await getDoc(doc(db, "users", uid));
    setUserDoc(userDocSnapshot.exists() ? userDocSnapshot.data() : null);
  };

  const cacheDelibsCollection = async () => {
    if (delibsCache) return;
    const querySnapshot = await getDocs(collection(db, "delibs"));
    const data = {};
    querySnapshot.forEach((doc) => (data[doc.id] = doc.data()));
    setDelibsCache(data);
  };

  const handleVote = useCallback(
    async (voteType) => {
      if (!user || !selectedDelibUserId || !userDoc) return; // Updated condition

      const newVote = currentVote === voteType ? null : voteType;
      const updatedVotes = { ...(userDoc.votes || {}) };

      if (newVote === null) {
        delete updatedVotes[selectedDelibUserId]; // Now using user ID as key
      } else {
        updatedVotes[selectedDelibUserId] = newVote; // Now using user ID as key
      }

      setCurrentVote(newVote);
      setUserDoc((prev) => ({ ...prev, votes: updatedVotes }));

      try {
        await updateDoc(doc(db, "users", user.uid), { votes: updatedVotes });
      } catch (error) {
        console.error("Error updating vote:", error);
        setCurrentVote(currentVote); // revert on error
      }
    },
    [user, selectedDelibUserId, currentVote, userDoc, db] // Updated dependency
  );

  const matchingDelibDoc = useMemo(() => {
    if (!delibsCache || !selectedDelibUserId) return null;
    // Now looking up by document ID instead of name
    return delibsCache[selectedDelibUserId] || null;
  }, [delibsCache, selectedDelibUserId]); // Updated dependencies

  if (loading) return <div>Loading...</div>;

  if (!matchingDelibDoc)
    return (
      <div>No matching document found for user ID: {selectedDelibUserId}</div>
    ); // Updated error message

  return (
    <>
      <div className="delib-profile-card">
        <div className="delib-profile-content">
          <div className="delib-image-container">
            {matchingDelibDoc.image ? (
              <img
                src={`https://drive.google.com/thumbnail?id=${matchingDelibDoc.image}&sz=w600`}
                alt={`Profile of ${matchingDelibDoc.name}`}
                className="delib-profile-image"
              />
            ) : (
              <div className="delib-profile-placeholder">👤</div>
            )}
          </div>

          <h2 className="delib-profile-name">{matchingDelibDoc.name}</h2>
          <div className="delib-profile-major">{matchingDelibDoc.major}</div>
          <div className="delib-profile-grad-date">
            <strong>Graduation:</strong> {matchingDelibDoc.gradYear}
          </div>

          {matchingDelibDoc.events?.length ? (
            <div className="delib-events-section">
              <h3 className="delib-events-title">Events</h3>

              <div className="delib-events-list">
                {matchingDelibDoc.events.map((event, idx) => (
                  <div key={idx} className="delib-event-item">
                    {event}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="delib-no-events">No events listed</div>
          )}
        </div>
      </div>

      <div className="delib-profile-card">
        <div className="voting-container">
          {["yes", "abstain", "no"].map((type) => (
            <button
              key={type}
              className="vote"
              onClick={() => handleVote(type)}
            >
              <img
                className="vote-img"
                src={`${type}${currentVote === type ? "On" : "Off"}.png`}
                alt={`${type} vote`}
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default DelibsClient;
