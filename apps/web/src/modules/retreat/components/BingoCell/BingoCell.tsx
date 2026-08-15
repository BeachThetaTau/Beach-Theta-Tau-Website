import type { RetreatBingoCell } from "@beach-theta-tau/contracts";

interface BingoCellProps {
  cell: RetreatBingoCell;
  onToggle: (cell: RetreatBingoCell) => void;
}

export function BingoCell({ cell, onToggle }: BingoCellProps) {
  return (
    <button
      type="button"
      className={`relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden break-words rounded-md border-2 p-2 text-center leading-tight shadow-card transition-[transform,box-shadow,border-color] duration-200 hover:scale-105 hover:shadow-elevated ${
        cell.marked ? "border-brand bg-surface-soft" : "border-line bg-surface"
      } ${cell.text.length > 19 ? "text-[0.5rem]" : "text-xs"} ${cell.marked ? "text-muted" : "text-text"}`}
      onClick={() => onToggle(cell)}
      aria-pressed={cell.marked}
    >
      {cell.text || "Empty"}
      {cell.marked && (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-[4rem] font-bold text-brand/80"
          aria-hidden="true"
        >
          ✕
        </span>
      )}
    </button>
  );
}
