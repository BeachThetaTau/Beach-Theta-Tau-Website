import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./DelibsMaster.css";

const db = getFirestore();
const auth = getAuth();

const DelibsMaster = () => {
  const [delibsData, setDelibsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedDelibDoc, setSelectedDelibDoc] = useState({
    id: null,
    userId: null,
  });
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voteData, setVoteData] = useState(null);
  const [loadingVotes, setLoadingVotes] = useState(false);
  const [bidGiven, setBidGiven] = useState(false);
  const [loadingBid, setLoadingBid] = useState(false);

  const usersSnapshotRef = useRef(null);
  const selectedDelibSnapshotRef = useRef(null);
  const currentSelectedProfileRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchInitialData();
      } else {
        setLoading(false);
        setError("Please sign in to view data");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      query(collection(db, "selectedDelib"), limit(1)),
      (snapshot) => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          setSelectedDelibDoc({
            id: docSnap.id,
            userId: docSnap.data().selectedDelib,
          });
        }
      },
      (err) => {
        console.error("Error listening to selectedDelib:", err);
      }
    );

    selectedDelibSnapshotRef.current = unsubscribe;
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!isModalOpen || !selectedProfile?.id) {
      if (usersSnapshotRef.current) {
        usersSnapshotRef.current();
        usersSnapshotRef.current = null;
      }
      setVoteData(null);
      return;
    }

    if (currentSelectedProfileRef.current === selectedProfile.id) {
      return;
    }

    if (usersSnapshotRef.current) {
      usersSnapshotRef.current();
    }

    setLoadingVotes(true);
    currentSelectedProfileRef.current = selectedProfile.id;

    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const votes = { yes: 0, no: 0, abstain: 0, total: 0 };

        snapshot.forEach((doc) => {
          const vote = doc.data().votes?.[selectedProfile.id]?.toLowerCase();
          if (vote && (vote === "yes" || vote === "no" || vote === "abstain")) {
            votes.total++;
            votes[vote]++;
          }
        });

        const totalVotes = votes.total;
        setVoteData({
          ...votes,
          yesPercent:
            totalVotes > 0 ? Math.round((votes.yes / totalVotes) * 100) : 0,
          noPercent:
            totalVotes > 0 ? Math.round((votes.no / totalVotes) * 100) : 0,
          abstainPercent:
            totalVotes > 0 ? Math.round((votes.abstain / totalVotes) * 100) : 0,
        });
        setLoadingVotes(false);
      },
      (err) => {
        console.error("Error listening to votes:", err);
        setVoteData(null);
        setLoadingVotes(false);
      }
    );

    usersSnapshotRef.current = unsubscribe;

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isModalOpen, selectedProfile?.id]);

  useEffect(() => {
    return () => {
      if (usersSnapshotRef.current) {
        usersSnapshotRef.current();
      }
      if (selectedDelibSnapshotRef.current) {
        selectedDelibSnapshotRef.current();
      }
    };
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await fetchDelibsData();
    setLoading(false);
  };

  const fetchDelibsData = async () => {
    try {
      const snapshot = await getDocs(collection(db, "delibs"));
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDelibsData(data);
    } catch (err) {
      console.error("Error fetching delibs data:", err);
      setError(`Error fetching data: ${err.message}`);
    }
  };

  const updateSelectedDelib = useCallback(
    async (userIdToUpdate) => {
      if (!selectedDelibDoc.id || selectedDelibDoc.userId === userIdToUpdate)
        return;
      try {
        await updateDoc(doc(db, "selectedDelib", selectedDelibDoc.id), {
          selectedDelib: userIdToUpdate,
        });
      } catch (err) {
        console.error("Failed to update selectedDelib:", err);
      }
    },
    [selectedDelibDoc]
  );

  const handleCardClick = (person) => {
    setSelectedProfile(person);
    setIsModalOpen(true);
    setBidGiven(person.bidReceived || false);
    updateSelectedDelib(person.id || "unknown-id");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProfile(null);
    setBidGiven(false);
    currentSelectedProfileRef.current = null;
  };

  const handleBidClick = async () => {
    if (!selectedProfile?.id) return;

    setLoadingBid(true);
    const newBidStatus = !bidGiven;

    try {
      await updateDoc(doc(db, "delibs", selectedProfile.id), {
        bidReceived: newBidStatus,
      });

      setBidGiven(newBidStatus);

      setDelibsData((prevData) =>
        prevData.map((person) =>
          person.id === selectedProfile.id
            ? { ...person, bidReceived: newBidStatus }
            : person
        )
      );

      setSelectedProfile((prev) => ({ ...prev, bidReceived: newBidStatus }));

      console.log(
        `Bid ${newBidStatus ? "given to" : "removed from"} ${selectedProfile?.name}`
      );
    } catch (error) {
      console.error("Error updating bid status:", error);
    } finally {
      setLoadingBid(false);
    }
  };

  const handleDownloadResults = async () => {
    try {
      const csvContent = generateCSV();

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `delibs_results_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Results downloaded successfully");
    } catch (error) {
      console.error("Error downloading results:", error);
    }
  };

  const generateCSV = () => {
    const headers = ["Name", "Email", "Bid Received"];

    const sortedData = [...delibsData].sort((a, b) => {
      if (a.bidReceived && !b.bidReceived) return -1;
      if (!a.bidReceived && b.bidReceived) return 1;

      const nameA = (a.name || "Unknown").toLowerCase();
      const nameB = (b.name || "Unknown").toLowerCase();
      return nameA.localeCompare(nameB);
    });

    const rows = sortedData.map((person) => [
      person.name || "Unknown",
      person.id || "No ID",
      person.bidReceived ? "Yes" : "No",
    ]);

    const allRows = [headers, ...rows];

    return allRows
      .map((row) =>
        row
          .map((field) =>
            typeof field === "string" &&
            (field.includes(",") || field.includes('"') || field.includes("\n"))
              ? `"${field.replace(/"/g, '""')}"`
              : field
          )
          .join(",")
      )
      .join("\n");
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  if (error)
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );

  return (
    <div className="delibs-master">
      <div className="header">
        <h1>Delibs Collection Profiles</h1>
        <div className="header-controls">
          <div className="count">Total Profiles: {delibsData.length}</div>
          <button
            className="download-results-btn"
            onClick={handleDownloadResults}
            disabled={delibsData.length === 0}
          >
            Download Results
          </button>
        </div>
      </div>

      <div className="cards-container">
        {delibsData
          .sort((a, b) =>
            (a.name || "")
              .toLowerCase()
              .localeCompare((b.name || "").toLowerCase())
          )
          .map((person) => (
            <div
              key={person.id}
              className="profile-card"
              onClick={() => handleCardClick(person)}
            >
              <div className="profile-image-container">
                {person.image ? (
                  <img
                    src={`https://drive.google.com/thumbnail?id=${person.image}&sz=w400`}
                    alt={`Profile of ${person.name}`}
                    className="profile-image"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`no-image-placeholder ${person.image ? "hidden" : ""}`}
                >
                  <span>No Image</span>
                </div>
              </div>
              <div className="profile-name">{person.name || "Unknown"}</div>
            </div>
          ))}
      </div>

      {delibsData.length === 0 && (
        <div className="empty-state">
          <p>No profiles found in the delibs collection.</p>
        </div>
      )}

      {isModalOpen && selectedProfile && (
        <div className="delibs-modal-overlay" onClick={closeModal}>
          <div className="delibs-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="delibs-modal-close" onClick={closeModal}>
              ×
            </button>
            <div className="delibs-modal-body">
              <div className="delibs-modal-image-section">
                <div className="delibs-modal-image-container">
                  {selectedProfile.image ? (
                    <img
                      src={`https://drive.google.com/thumbnail?id=${selectedProfile.image}&sz=w600`}
                      alt={`Profile of ${selectedProfile.name}`}
                      className="delibs-modal-image"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`modal-no-image-placeholder ${selectedProfile.image ? "hidden" : ""}`}
                  >
                    <span>No Image</span>
                  </div>
                </div>
              </div>
              <div className="delibs-modal-info-section">
                <h2 className="delibs-modal-name">{selectedProfile.name}</h2>

                <div className="bid-section">
                  <button
                    className={`give-bid-btn ${bidGiven ? "bid-given" : ""} ${loadingBid ? "loading" : ""}`}
                    onClick={handleBidClick}
                    disabled={loadingBid}
                  >
                    {loadingBid ? "Updating..." : "Give Bid"}
                  </button>
                </div>

                <div className="delibs-modal-details">
                  <div className="detail-row">
                    <span className="detail-label">Major:</span>
                    <span className="detail-value">
                      {selectedProfile.major || "Not specified"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Graduation Year:</span>
                    <span className="detail-value">
                      {selectedProfile.gradYear || "Not specified"}
                    </span>
                  </div>
                </div>
                <div className="events-section">
                  <h3>Events:</h3>
                  <div className="event-tags">
                    {selectedProfile.events?.length > 0 ? (
                      selectedProfile.events.map((event, i) => (
                        <span key={i} className="event-tag">
                          {event}
                        </span>
                      ))
                    ) : (
                      <span className="no-events">No events listed</span>
                    )}
                  </div>
                </div>

                <div className="vote-section">
                  <h3>Live Vote Results</h3>

                  {loadingVotes && (
                    <div className="vote-loading">
                      <div className="spinner-small"></div>
                      <span>Loading votes...</span>
                    </div>
                  )}

                  {voteData && !loadingVotes && (
                    <div className="vote-results">
                      <div className="vote-bar-container">
                        <div className="vote-bar">
                          <div
                            className="vote-segment yes-segment"
                            style={{ width: `${voteData.yesPercent}%` }}
                          >
                            {voteData.yesPercent > 0 && (
                              <span>{voteData.yesPercent}%</span>
                            )}
                          </div>
                          <div
                            className="vote-segment no-segment"
                            style={{ width: `${voteData.noPercent}%` }}
                          >
                            {voteData.noPercent > 0 && (
                              <span>{voteData.noPercent}%</span>
                            )}
                          </div>
                          <div
                            className="vote-segment abstain-segment"
                            style={{ width: `${voteData.abstainPercent}%` }}
                          >
                            {voteData.abstainPercent > 0 && (
                              <span>{voteData.abstainPercent}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="vote-legend">
                        <div className="legend-item">
                          <span className="legend-color yes-color"></span>
                          <span>Yes ({voteData.yesPercent}%)</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color no-color"></span>
                          <span>No ({voteData.noPercent}%)</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color abstain-color"></span>
                          <span>Abstain ({voteData.abstainPercent}%)</span>
                        </div>
                      </div>
                      <div className="vote-summary">
                        <p>
                          Total Votes: {voteData.total} | Yes: {voteData.yes} |
                          No: {voteData.no} | Abstain: {voteData.abstain}
                        </p>
                      </div>
                    </div>
                  )}

                  {!voteData && !loadingVotes && (
                    <div className="vote-placeholder">
                      <p>No votes found for this profile</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DelibsMaster;