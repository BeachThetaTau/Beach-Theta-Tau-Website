import { useCallback, useEffect, useState } from "react";

interface Options {
  /** How many additional items to reveal each time more is loaded. */
  pageSize?: number;
  /** How many items to show initially (defaults to one page). */
  initial?: number;
  /** Distance from the sentinel at which to start loading the next page. */
  rootMargin?: string;
}

interface InfiniteScroll {
  /** Number of items that should currently be rendered. */
  visibleCount: number;
  /** Whether more items remain to be revealed. */
  hasMore: boolean;
  /** Reveal the next page of items. */
  loadMore: () => void;
  /** Attach to an element rendered at the end of the list to auto-load on scroll. */
  sentinelRef: (node: HTMLElement | null) => void;
}

/**
 * Progressively reveals a slice of a larger, already-loaded list. Rendering is
 * capped at `visibleCount`; scrolling the sentinel into view (or calling
 * `loadMore`) reveals the next page. Resets when `total` changes so filtering
 * or switching lists starts fresh.
 */
export function useInfiniteScroll(total: number, options: Options = {}): InfiniteScroll {
  const { pageSize = 40, initial = pageSize, rootMargin = "600px 0px" } = options;

  const [visibleCount, setVisibleCount] = useState(() => Math.min(initial, total));
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setVisibleCount(Math.min(initial, total));
  }, [total, initial]);

  const hasMore = visibleCount < total;

  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + pageSize, total));
  }, [pageSize, total]);

  useEffect(() => {
    if (!sentinel || !hasMore || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // `visibleCount` is intentionally a dependency: re-creating the observer
    // after each load re-checks intersection, so a sentinel still in view on a
    // tall screen keeps advancing instead of stalling.
  }, [sentinel, hasMore, loadMore, rootMargin, visibleCount]);

  return { visibleCount, hasMore, loadMore, sentinelRef: setSentinel };
}

export default useInfiniteScroll;
