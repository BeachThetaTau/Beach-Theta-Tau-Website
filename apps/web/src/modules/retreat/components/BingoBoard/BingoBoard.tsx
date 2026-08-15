import { EmptyState } from "@/shared/ui/EmptyState/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState/LoadingState";
import { useBingoBoard } from "../../hooks/useBingoBoard";
import { BingoCell } from "../BingoCell/BingoCell";

export function BingoBoard() {
  const board = useBingoBoard();

  if (board.loading) return <LoadingState label="Loading the retreat bingo board…" />;
  if (board.error && !board.rows.length) {
    return <EmptyState title="Bingo board unavailable" description={board.error} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-[34rem] flex-col gap-2 px-4">
      {board.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {board.error}
        </p>
      )}
      {board.rows.map((row, rowIndex) => (
        <div className="grid grid-cols-5 gap-2" key={rowIndex}>
          {row.map((cell) => (
            <BingoCell cell={cell} onToggle={(item) => void board.toggleCell(item)} key={cell.id} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default BingoBoard;
