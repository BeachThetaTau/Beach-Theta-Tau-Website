import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import "./BingoGame.css";

const db = getFirestore();

function BingoGame() {
  const [bingoGrid, setBingoGrid] = useState<any[][]>([]);

  useEffect(() => {
    const bingoCol = collection(db, "Bingo");
    const bingoQuery = query(bingoCol, orderBy("id"));

    // Subscribe to realtime updates
    const unsubscribe = onSnapshot(
      bingoQuery,
      (snapshot) => {
        const bingoDocs = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data();
          return {
            ...data,
            id: docSnapshot.id,
            marked: data.marked ?? false,
          };
        });

        const grid: any[][] = [];
        for (let i = 0; i < 5; i++) {
          grid.push(bingoDocs.slice(i * 5, i * 5 + 5));
        }
        setBingoGrid(grid);
      },
      (err) => {
        console.error("Realtime listener error:", err);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSquareClick = async (rowIndex: number, colIndex: number) => {
    const newGrid = [...bingoGrid];
    const item = newGrid[rowIndex][colIndex];

    // Toggle the marked status
    const newMarkedStatus = !item.marked;
    newGrid[rowIndex][colIndex] = {
      ...item,
      marked: newMarkedStatus,
    };
    setBingoGrid(newGrid);

    // Update Firestore
    try {
      const itemRef = doc(db, "Bingo", String(item.id));
      await updateDoc(itemRef, { marked: newMarkedStatus });
    } catch (err) {
      console.error("Failed to update marked status:", err);
    }
  };

  return (
    <div className="bingo-grid">
      {bingoGrid.map((row, rowIndex) => (
        <div className="bingo-row" key={rowIndex}>
          {row.map((item, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={
                `bingo-card ${item?.text.length > 19 ? "small-text" : "normal-text"} ` +
                `${item.marked ? "marked" : ""}`
              }
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {item?.text || "Empty"}
              {item.marked && <div className="red-x">X</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default BingoGame;
