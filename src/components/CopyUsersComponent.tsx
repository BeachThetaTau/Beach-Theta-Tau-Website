import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";

type ConditionFunction = (userData: any) => boolean;

const CopyUsersComponent = ({
  conditionFn,
  inputCollection,
  outputCollection,
}: {
  conditionFn: ConditionFunction;
  inputCollection: string;
  outputCollection: string;
}) => {
  const [loading, setLoading] = useState(false);

  const copyUsers = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      const usersCollectionRef = collection(db, inputCollection);
      const usersSnapshot = await getDocs(usersCollectionRef);
      let batch = writeBatch(db);
      let batchCount = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userId = userDoc.id;

        if (conditionFn(userData)) {
          const { copied, verified, ...filteredUserData } = userData;

          const outputUserDocRef = doc(db, outputCollection, userId);
          const outputUserDoc = await getDoc(outputUserDocRef);

          if (!outputUserDoc.exists() || !userData.copied) {
            batch.set(outputUserDocRef, filteredUserData);

            // Delete the original document instead of just updating
            const userDocRef = doc(db, inputCollection, userId);
            batch.delete(userDocRef);

            batchCount++;

            if (batchCount >= 500) {
              await batch.commit();
              batch = writeBatch(db); // Start a new batch
              batchCount = 0;
            }
          }
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }
    } catch (error) {
      console.error("Error copying and deleting users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      copyUsers();
    }
  }, []);

  return <></>;
};

export default CopyUsersComponent;

{/*
      <CopyUsersComponent
        conditionFn={(user) => user.gradYear <= 2025}
        inputCollection="users"
        outputCollection="Alumni"
      />
*/}
