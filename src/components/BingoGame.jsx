import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./BingoGame.css";

const db = getFirestore();

function BingoGame() {
  const [user, setUser] = useState(null);
  const [bingoGrid, setBingoGrid] = useState([]);

  // Watch auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Only subscribe to Firestore when signed in
  useEffect(() => {
    if (!user) return;

    const bingoCol = collection(db, "Bingo");
    const bingoQuery = query(bingoCol, orderBy("id"));

    const unsubscribeSnapshot = onSnapshot(
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

        const grid = [];
        for (let i = 0; i < 5; i++) {
          grid.push(bingoDocs.slice(i * 5, i * 5 + 5));
        }
        setBingoGrid(grid);
      },
      (err) => {
        console.error("Realtime listener error:", err);
      }
    );

    return () => unsubscribeSnapshot();
  }, [user]);

  const handleSquareClick = async (rowIndex, colIndex) => {
    const newGrid = [...bingoGrid];
    const item = newGrid[rowIndex][colIndex];
    const newMarkedStatus = !item.marked;

    newGrid[rowIndex][colIndex] = {
      ...item,
      marked: newMarkedStatus,
    };
    setBingoGrid(newGrid);

    try {
      const itemRef = doc(db, "Bingo", String(item.id));
      await updateDoc(itemRef, { marked: newMarkedStatus });
    } catch (err) {
      console.error("Failed to update marked status:", err);
    }
  };

  // If not signed in, show a placeholder or prompt
  if (!user) {
    return (
      <div className="bingo-grid">
        <p>Please log in to view and play the Bingo game.</p>
      </div>
    );
  }

  return (
    <div className="bingo-grid">
      {bingoGrid.map((row, rowIndex) => (
        <div className="bingo-row" key={rowIndex}>
          {row.map((item, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={
                `bingo-card ${item?.text?.length > 19 ? "small-text" : "normal-text"} ` +
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
