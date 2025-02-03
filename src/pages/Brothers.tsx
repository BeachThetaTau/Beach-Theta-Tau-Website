import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import "./Brothers.css";
import GenerateParallax from "../components/PillarsParallax";
import Modal from "../components/Modal";
import LinkedInButton from "../components/LinkedInButton";
import ResumeButton from "../components/ResumeButton";

interface User {
  name: string;
  class: string;
  gradYear?: string;
  major?: string;
  linkedIn?: string;
  resumeLink?: string;
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

function Brothers() {
  const [usersByClass, setUsersByClass] = useState<Record<string, User[]>>(
    Object.fromEntries(greekAlphabetOrder.map((letter) => [letter, []]))
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
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
    };

    fetchUsers();
  }, []);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <>
      <GenerateParallax
        fileName="Brothers.jpg"
        title="Meet brothers of Theta Tau"
      />
      {/* Modal Component */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedUser && (
          <div className="modal-container">
            <button onClick={() => setIsModalOpen(false)}>&times;</button>
            <div className="modal-content">
              <img src="Brothers/blank-pfp.webp" alt="" />
              <div className="modal-details">
                <h2>{selectedUser.name}</h2>
                <p>Major: {selectedUser.major || "N/A"}</p>
                <p>Graduation Year: {selectedUser.gradYear || "N/A"}</p>

                <div className="modal-buttons">
                  {/* Display LinkedIn Button only if linkedIn field exists */}
                  {selectedUser.linkedIn && (
                    <LinkedInButton linkedinUrl={selectedUser.linkedIn} />
                  )}
                  {/* Display Resume Button only if resume field exists */}
                  {selectedUser.resumeLink && (
                    <ResumeButton resumeUrl={selectedUser.resumeLink} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Brothers listing */}
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
                    <img
                      src="/Brothers/blank-pfp.webp"
                      alt={`${user.name}'s profile`}
                    />
                    <h1>{user.name}</h1>
                    <p>
                      {user.major} | <i className="gradYear">{user.gradYear}</i>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

export default Brothers;
