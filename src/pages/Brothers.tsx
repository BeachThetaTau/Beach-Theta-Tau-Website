import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import "./Brothers.css";
import GenerateParallax from "../components/PillarsParallax";
import Modal from "../components/Modal";
import LinkedInButton from "../components/LinkedInButton";
import ResumeButton from "../components/ResumeButton";
import Toggle from "../components/Toggle";

interface User {
  name: string;
  class: string;
  gradYear?: string;
  major?: string;
  linkedIn?: string;
  resumeLink?: string;
  position?: string;
  verified?: boolean;
}

const baseGreekAlphabet = [
  "Alpha",
  "Beta",
  "Gamma",
  "Delta",
  "Epsilon",
  "Zeta",
  "Eta",
  "Theta",
  "Iota",
  "Kappa",
  "Lambda",
  "Mu",
  "Nu",
  "Xi",
  "Omicron",
  "Pi",
  "Rho",
  "Sigma",
  "Tau",
  "Upsilon",
  "Phi",
  "Chi",
  "Psi",
  "Omega",
];

const eboard = [
  "Regent",
  "Vice-Regent",
  "Treasurer",
  "Scribe",
  "Corresponding Secretary",
  "Marshal",
];

const generateExtendedGreekAlphabet = (
  baseAlphabet: string[],
  levels: number
): string[] => {
  const extendedAlphabet: string[] = [...baseAlphabet];
  for (let i = 1; i < levels; i++) {
    baseAlphabet.forEach((first) => {
      baseAlphabet.forEach((second) => {
        extendedAlphabet.push(`${first} ${second}`);
      });
    });
  }
  return extendedAlphabet.reverse();
};

const greekAlphabetOrder = generateExtendedGreekAlphabet(baseGreekAlphabet, 2);

const generatePfpUrl = (name: string): string => {
  const cleanedName = name.replace(/[^a-zA-Z]/g, "").toLowerCase();
  return `/Brothers/${cleanedName}.webp`;
};

function Brothers() {
  const [usersByClass, setUsersByClass] = useState<Record<string, User[]>>(
    Object.fromEntries(greekAlphabetOrder.map((letter) => [letter, []]))
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showOfficers, setShowOfficers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const db = getFirestore();
        const usersCollection = collection(db, "users");
        const querySnapshot = await getDocs(usersCollection);

        const updatedUsersMap: Record<string, User[]> = Object.fromEntries(
          greekAlphabetOrder.map((letter) => [letter, []])
        );

        querySnapshot.forEach((doc) => {
          const userData = doc.data() as User;
          if (
            userData.name &&
            userData.class &&
            greekAlphabetOrder.includes(userData.class)
          ) {
            updatedUsersMap[userData.class].push(userData);
          }
        });

        Object.keys(updatedUsersMap).forEach((letter) => {
          updatedUsersMap[letter].sort((a, b) => a.name.localeCompare(b.name));
        });

        setUsersByClass(updatedUsersMap);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const allUsers = Object.values(usersByClass).flat();
  const eboardMembers = allUsers
    .filter((user) => user.position && eboard.includes(user.position))
    .sort((a, b) => eboard.indexOf(a.position!) - eboard.indexOf(b.position!));
  const chairs = allUsers
    .filter((user) => user.position && !eboard.includes(user.position))
    .sort((a, b) => a.position!.localeCompare(b.position!));

  return (
    <>
      <GenerateParallax
        fileName="Brothers.jpg"
        title="Meet brothers of Theta Tau"
      />

      <div className="brothers">
        <Toggle isChecked={showOfficers} onToggle={setShowOfficers} />

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          {selectedUser && (
            <div className="modal-container">
              <button onClick={() => setIsModalOpen(false)}>&times;</button>
              <div className="modal-content">
                <LazyLoadImage
                  effect="blur"
                  src={
                    selectedUser.verified
                      ? generatePfpUrl(selectedUser.name)
                      : "/Brothers/blank-pfp.webp"
                  }
                  alt=""
                />
                <div className="modal-details">
                  <h2>{selectedUser.name}</h2>
                  {selectedUser.position && (
                    <p>Position: {selectedUser.position}</p>
                  )}
                  <p>Major: {selectedUser.major || "N/A"}</p>
                  <p>Graduation Year: {selectedUser.gradYear || "N/A"}</p>
                  <div className="modal-buttons">
                    {selectedUser.linkedIn && (
                      <LinkedInButton linkedinUrl={selectedUser.linkedIn} />
                    )}
                    {selectedUser.resumeLink && (
                      <ResumeButton resumeUrl={selectedUser.resumeLink} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {!showOfficers ? (
          <div className="brothers-list">
            {greekAlphabetOrder
              .filter((letter) => usersByClass[letter].length > 0)
              .map((letter) => (
                <div key={letter} className="brother-section">
                  <h2>{letter}</h2>
                  <div className="brother-cards">
                    {usersByClass[letter].map((user, index) => (
                      <div
                        key={index}
                        className="brother-card"
                        onClick={() => handleUserClick(user)}
                        style={{ cursor: "pointer" }}
                      >
                        <LazyLoadImage
                          effect="blur"
                          src={
                            user.verified
                              ? generatePfpUrl(user.name)
                              : "/Brothers/blank-pfp.webp"
                          }
                          alt={`${user.name}'s profile`}
                        />
                        <h1>{user.name}</h1>
                        <p>
                          {user.major} |{" "}
                          <i className="gradYear">{user.gradYear}</i>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="officers-listing">
            {eboardMembers.length > 0 && (
              <div className="brother-section">
                <h2>Executive Board</h2>
                <div className="brother-cards">
                  {eboardMembers.map((user, index) => (
                    <div
                      key={index}
                      className="brother-card"
                      onClick={() => handleUserClick(user)}
                      style={{ cursor: "pointer" }}
                    >
                      <LazyLoadImage
                        effect="blur"
                        src={
                          user.verified
                            ? generatePfpUrl(user.name)
                            : "/Brothers/blank-pfp.webp"
                        }
                        alt={`${user.name}'s profile`}
                      />
                      <h1>{user.name}</h1>
                      <p className="position">{user.position}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {chairs.length > 0 && (
              <div className="brother-section">
                <h2>Committee Chairs</h2>
                <div className="brother-cards">
                  {chairs.map((user, index) => (
                    <div
                      key={index}
                      className="brother-card"
                      onClick={() => handleUserClick(user)}
                      style={{ cursor: "pointer" }}
                    >
                      <LazyLoadImage
                        effect="blur"
                        src={
                          user.verified
                            ? generatePfpUrl(user.name)
                            : "/Brothers/blank-pfp.webp"
                        }
                        alt={`${user.name}'s profile`}
                      />
                      <h1>{user.name}</h1>
                      <p className="position">{user.position}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Brothers;
