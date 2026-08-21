// A tiny framework-agnostic store for normalized scroll progress.
//
// Why not React state: the R3F render loop reads scroll progress every frame
// (60+ Hz) inside useFrame. Routing that through React state would trigger a
// re-render per frame and defeat the purpose. Instead we keep a plain mutable
// value that:
//   - useFrame reads directly (no React involvement, zero re-renders), and
//   - DOM widgets (the progress bar, chapter indicator) subscribe to via
//     useSyncExternalStore, which only re-renders them when the value changes.
//
// `progress` is the whole-journey position in [0, 1]. `chapter` is the active
// chapter index. Both are written once per frame by the Lenis scroll driver
// (see useLenisScroll) and read everywhere else.

export interface ScrollSnapshot {
  /** Whole-page scroll position, 0 (top) → 1 (bottom of the document). */
  progress: number;
  /**
   * Position across the chapter sections only: 0 when the first chapter is
   * flush with the viewport, 1 when the last one is. Unlike `progress` this
   * ignores everything after the final chapter — the site footer adds roughly
   * 15% of page height, which left the raw ratio permanently behind the
   * sections (the last chapter sat at 0.845, never 1). Anything that must line
   * up with a specific chapter reads this.
   */
  journey: number;
  /** Index of the chapter currently filling the viewport. */
  chapter: number;
  /** Progress within the active chapter, 0 → 1. */
  chapterProgress: number;
}

let snapshot: ScrollSnapshot = { progress: 0, journey: 0, chapter: 0, chapterProgress: 0 };
const listeners = new Set<() => void>();

export const scrollStore = {
  /** Read the current snapshot. Safe to call inside useFrame. */
  get(): ScrollSnapshot {
    return snapshot;
  },
  /**
   * Replace the snapshot and notify subscribers. Skips the notify when nothing
   * meaningfully changed so DOM subscribers don't churn on sub-pixel jitter.
   */
  set(next: ScrollSnapshot): void {
    const prev = snapshot;
    if (
      prev.progress === next.progress &&
      prev.journey === next.journey &&
      prev.chapter === next.chapter &&
      prev.chapterProgress === next.chapterProgress
    ) {
      return;
    }
    snapshot = next;
    listeners.forEach((l) => l());
  },
  /** Subscribe to changes. Returns an unsubscribe fn. For useSyncExternalStore. */
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Reset to top — call when the experience unmounts so a remount starts clean. */
  reset(): void {
    this.set({ progress: 0, journey: 0, chapter: 0, chapterProgress: 0 });
  },
};
