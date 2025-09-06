import React, { useEffect, useState, useMemo } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import "./Brothers.css";
import GenerateParallax from "../components/PillarsParallax";
import Modal from "../components/Modal";
import LinkedInButton from "../components/LinkedInButton";
import ResumeButton from "../components/ResumeButton";
import Toggle from "../components/Toggle";

// User interface defines the structure of each brother's data
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
  const extended: string[] = [...baseAlphabet];
  for (let i = 1; i < levels; i++) {
    baseAlphabet.forEach((first) =>
      baseAlphabet.forEach((second) => extended.push(`${first} ${second}`))
    );
  }
  return extended.reverse();
};

const greekAlphabetOrder = generateExtendedGreekAlphabet(baseGreekAlphabet, 2);

const generatePfpUrl = (name: string) => {
  const cleaned = name.replace(/[^a-zA-Z]/g, "").toLowerCase();
  return `/Brothers/${cleaned}.webp`;
};

// Reusable section component for officers and chairs
type OfficersSectionProps = {
  title: string;
  members: User[];
  onClick: (user: User) => void;
};

const OfficersSection: React.FC<OfficersSectionProps> = ({
  title,
  members,
  onClick,
}) => (
  <div className="brother-section">
    <h2>{title}</h2>
    <div className="brother-cards">
      {members.map((user) => (
        <div
          key={user.name}
          className="brother-card"
          style={{ cursor: "pointer" }}
          onClick={() => onClick(user)}
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
);

const Brothers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showOfficers, setShowOfficers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const db = getFirestore();
        const snapshot = await getDocs(collection(db, "users"));
        setUsers(snapshot.docs.map((doc) => doc.data() as User));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const usersByClass = useMemo(() => {
    const map = Object.fromEntries(
      greekAlphabetOrder.map((letter) => [letter, [] as User[]])
    );
    users.forEach((u) => {
      if (map[u.class]) map[u.class].push(u);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => a.name.localeCompare(b.name))
    );
    return map;
  }, [users]);

  const { eboardMembers, chairs } = useMemo(() => {
    const eboardMembers = users
      .filter((u) => u.position && eboard.includes(u.position))
      .sort(
        (a, b) => eboard.indexOf(a.position!) - eboard.indexOf(b.position!)
      );
    const chairs = users
      .filter((u) => u.position && !eboard.includes(u.position))
      .sort((a, b) => a.position!.localeCompare(b.position!));
    return { eboardMembers, chairs };
  }, [users]);

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

      <div className="brothers">
        <Toggle isChecked={showOfficers} onToggle={setShowOfficers} />

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          {selectedUser && (
            <div className="brothers-modal-container">
              <button onClick={() => setIsModalOpen(false)}>&times;</button>
              <div className="brothers-modal-content">
                <LazyLoadImage
                  effect="blur"
                  src={
                    selectedUser.verified
                      ? generatePfpUrl(selectedUser.name)
                      : "/Brothers/blank-pfp.webp"
                  }
                  alt=""
                />
                <div className="brothers-modal-details">
                  <h2>{selectedUser.name}</h2>
                  {selectedUser.position && (
                    <p>Position: {selectedUser.position}</p>
                  )}
                  <p>Major: {selectedUser.major || "N/A"}</p>
                  <p>Graduation Year: {selectedUser.gradYear || "N/A"}</p>
                  <div className="brothers-modal-buttons">
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

        {showOfficers ? (
          <>
            {eboardMembers.length > 0 && (
              <OfficersSection
                title="Executive Board"
                members={eboardMembers}
                onClick={handleUserClick}
              />
            )}
            {chairs.length > 0 && (
              <OfficersSection
                title="Committee Chairs"
                members={chairs}
                onClick={handleUserClick}
              />
            )}
          </>
        ) : (
          <>
            {greekAlphabetOrder.map((letter) =>
              usersByClass[letter]?.length ? (
                <div key={letter} className="brother-section">
                  <h2>{letter}</h2>
                  <div className="brother-cards">
                    {usersByClass[letter].map((user) => (
                      <div
                        key={user.name}
                        className="brother-card"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleUserClick(user)}
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
                          {user.major} | <i>{user.gradYear}</i>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Brothers;
