import type { RetreatBingoCell } from "@beach-theta-tau/contracts";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/shared/lib/firebase/firestore";

export function subscribeBingoBoard(
  onChange: (cells: RetreatBingoCell[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(db, "Bingo"), orderBy("id")),
    (snapshot) =>
      onChange(
        snapshot.docs.map((cellDocument) => ({
          id: cellDocument.id,
          text: String(cellDocument.data().text ?? ""),
          marked: Boolean(cellDocument.data().marked),
        })),
      ),
    onError,
  );
}

export async function setBingoCellMarked(cellId: string, marked: boolean) {
  await updateDoc(doc(db, "Bingo", cellId), { marked });
}
