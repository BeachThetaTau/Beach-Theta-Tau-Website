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

interface MoveDocumentsComponentProps {
  conditionFn: ConditionFunction;
  inputCollection: string;
  outputCollection: string;
  deleteAfterCopy?: boolean;
}

const MoveDocumentsComponent = ({
  conditionFn,
  inputCollection,
  outputCollection,
  deleteAfterCopy = false,
}: MoveDocumentsComponentProps) => {
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

            if (deleteAfterCopy) {
              const userDocRef = doc(db, inputCollection, userId);
              batch.delete(userDocRef);
            }

            batchCount++;
            if (batchCount >= 500) {
              await batch.commit();
              batch = writeBatch(db);
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
      console.log("Moved Documents");
    }
  }, []);

  return null;
};

export default MoveDocumentsComponent;

{
  /*
  // Default behavior (does NOT delete original document)
  <MoveDocumentsComponent
    conditionFn={(user) => user.gradYear <= 2025}
    inputCollection="users"
    outputCollection="Alumni"
  />

  // With deletion enabled
  <MoveDocumentsComponent
    conditionFn={(user) => user.gradYear <= 2025}
    inputCollection="users"
    outputCollection="Alumni"
    deleteAfterCopy={true}
  />
*/
}
