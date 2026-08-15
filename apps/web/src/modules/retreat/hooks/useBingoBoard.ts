import type { RetreatBingoCell } from "@beach-theta-tau/contracts";
import { useEffect, useMemo, useState } from "react";
import { setBingoCellMarked, subscribeBingoBoard } from "../api/bingo.repository";

export function useBingoBoard() {
  const [cells, setCells] = useState<RetreatBingoCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeBingoBoard(
        (nextCells) => {
          setCells(nextCells);
          setLoading(false);
        },
        (nextError) => {
          setError(nextError.message);
          setLoading(false);
        },
      ),
    [],
  );

  const rows = useMemo(
    () =>
      Array.from({ length: Math.ceil(cells.length / 5) }, (_, index) =>
        cells.slice(index * 5, index * 5 + 5),
      ),
    [cells],
  );

  const toggleCell = async (cell: RetreatBingoCell) => {
    const marked = !cell.marked;
    setCells((current) =>
      current.map((item) => (item.id === cell.id ? { ...item, marked } : item)),
    );
    try {
      await setBingoCellMarked(cell.id, marked);
    } catch (nextError) {
      setCells((current) => current.map((item) => (item.id === cell.id ? cell : item)));
      setError(
        nextError instanceof Error ? nextError.message : "Unable to update the bingo square.",
      );
    }
  };

  return { rows, loading, error, toggleCell };
}
