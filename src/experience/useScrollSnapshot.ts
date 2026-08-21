import { useSyncExternalStore } from 'react';
import { scrollStore, type ScrollSnapshot } from './scrollStore';

/**
 * React binding for the scroll store. DOM widgets (progress bar, chapter
 * indicator, later the overlay copy) call this to re-render only when the
 * snapshot actually changes — not once per animation frame. The 3D layer does
 * NOT use this; it reads scrollStore.get() directly inside useFrame.
 */
export function useScrollSnapshot(): ScrollSnapshot {
  return useSyncExternalStore(
    scrollStore.subscribe,
    scrollStore.get,
    // Server / pre-hydration snapshot.
    () => ({ progress: 0, chapter: 0, chapterProgress: 0 })
  );
}
