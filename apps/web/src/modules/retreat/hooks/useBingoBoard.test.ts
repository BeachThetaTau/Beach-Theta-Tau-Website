import type { RetreatBingoCell } from "@beach-theta-tau/contracts";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setBingoCellMarked, subscribeBingoBoard } from "../api/bingo.repository";
import { useBingoBoard } from "./useBingoBoard";

vi.mock("../api/bingo.repository", () => ({
  setBingoCellMarked: vi.fn(),
  subscribeBingoBoard: vi.fn(),
}));
let receive: (cells: RetreatBingoCell[]) => void;
let fail: (error: Error) => void;
const unsubscribe = vi.fn();
const cells = Array.from({ length: 6 }, (_, index) => ({
  id: String(index),
  text: `Task ${index}`,
  marked: false,
}));
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(subscribeBingoBoard).mockImplementation((onChange, onError) => {
    receive = onChange;
    fail = onError!;
    return unsubscribe;
  });
});
afterEach(cleanup);

describe("bingo board", () => {
  it("loads live cells into rows of five and unsubscribes on unmount", () => {
    const { result, unmount } = renderHook(useBingoBoard);
    expect(result.current.loading).toBe(true);
    act(() => receive(cells));
    expect(result.current.loading).toBe(false);
    expect(result.current.rows).toEqual([cells.slice(0, 5), cells.slice(5)]);
    act(() => receive([]));
    expect(result.current.rows).toEqual([]);
    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
  it("surfaces subscription failures and stops loading", () => {
    const { result } = renderHook(useBingoBoard);
    act(() => fail(new Error("offline")));
    expect(result.current).toMatchObject({ loading: false, error: "offline" });
  });
  it("updates optimistically and persists marking and unmarking", async () => {
    let resolve!: () => void;
    vi.mocked(setBingoCellMarked).mockReturnValueOnce(
      new Promise<void>((done) => {
        resolve = done;
      }),
    );
    const { result } = renderHook(useBingoBoard);
    act(() => receive(cells));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.toggleCell(cells[0]!);
    });
    expect(result.current.rows[0]![0]!.marked).toBe(true);
    expect(result.current.rows[0]![1]!).toEqual(cells[1]);
    await act(async () => {
      resolve();
      await pending;
    });
    await act(async () => {
      await result.current.toggleCell(result.current.rows[0]![0]!);
    });
    expect(setBingoCellMarked).toHaveBeenNthCalledWith(1, "0", true);
    expect(setBingoCellMarked).toHaveBeenNthCalledWith(2, "0", false);
    expect(result.current.rows[0]![0]!.marked).toBe(false);
  });
  it.each([new Error("permission denied"), "unknown"])(
    "rolls back failed writes (%s)",
    async (error) => {
      vi.mocked(setBingoCellMarked).mockRejectedValueOnce(error);
      const { result } = renderHook(useBingoBoard);
      act(() => receive(cells));
      await act(async () => {
        await result.current.toggleCell(cells[0]!);
      });
      expect(result.current.rows.flat()).toEqual(cells);
      expect(result.current.error).toBe(
        error instanceof Error ? error.message : "Unable to update the bingo square.",
      );
    },
  );
});
