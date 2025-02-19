import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";

const CopyUsersComponent = () => {
  const [loading, setLoading] = useState(false);

  const copyUsersToVerifiedUsers = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      const usersCollectionRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollectionRef);
      const batch = writeBatch(db);

      let batchCount = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userId = userDoc.id;

        if (userData.verified && !userData.copied) {
          const { copied, verified, ...filteredUserData } = userData;

          const verifiedUserDocRef = doc(db, "verifiedUsers", userId);
          const verifiedUserDoc = await getDoc(verifiedUserDocRef);

          if (!verifiedUserDoc.exists() || !userData.copied) {
            // If the user doesn't exist in verifiedUsers or copied is false, overwrite the data
            batch.set(verifiedUserDocRef, filteredUserData);

            // Update the 'copied' field in the original user document
            const userDocRef = doc(db, "users", userId);
            batch.update(userDocRef, { copied: true });

            batchCount++;

            // Commit the batch if it reaches the limit (500 operations)
            if (batchCount >= 500) {
              await batch.commit();
              batchCount = 0;
            }
          }
        }
      }

      // Commit any remaining operations in the batch
      if (batchCount > 0) {
        await batch.commit();
      }
    } catch (error) {
      console.error("Error copying users to verifiedUsers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      copyUsersToVerifiedUsers();
    }
  }, []);

  return <></>;
};

export default CopyUsersComponent;
