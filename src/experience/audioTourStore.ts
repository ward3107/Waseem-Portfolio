// A tiny framework-agnostic store bridging the DOM audio tour to the 3D
// talking head — the same pattern as scrollStore, and for the same reason: the
// R3F render loop reads the mouth openness every frame (60+ Hz), so it must be
// a plain mutable value the head can read inside useFrame with zero React
// re-renders. DOM widgets that only care about the coarse `active` flag
// subscribe via useSyncExternalStore instead.
//
//   - `active`     — the narration tour is on (a face should be shown).
//   - `conversing` — a live voice conversation with the agent is connected. The
//                    face is shown while either `active` or `conversing` is set,
//                    and the conversation drives the mouth (the narration yields).
//   - `speaking`   — the current source (narration clip or agent) is speaking.
//   - `mouth`      — live mouth openness 0 (closed) → 1 (wide), from the
//                    narration's amplitude, the agent's output volume, or a
//                    procedural talking envelope as a fallback.

export interface AudioTourSnapshot {
  active: boolean;
  conversing: boolean;
  speaking: boolean;
  mouth: number;
}

let snapshot: AudioTourSnapshot = { active: false, conversing: false, speaking: false, mouth: 0 };
const listeners = new Set<() => void>();

export const audioTourStore = {
  /** Read the current snapshot. Safe to call inside useFrame. */
  get(): AudioTourSnapshot {
    return snapshot;
  },
  /**
   * Merge a partial update and notify subscribers. `mouth` changes every frame
   * but is not part of the coarse subscription contract — DOM subscribers only
   * re-render when `active` or `speaking` flips (see the equality check), so
   * per-frame mouth writes stay free.
   */
  set(patch: Partial<AudioTourSnapshot>): void {
    const next = { ...snapshot, ...patch };
    const coarseChanged =
      next.active !== snapshot.active ||
      next.conversing !== snapshot.conversing ||
      next.speaking !== snapshot.speaking;
    snapshot = next;
    if (coarseChanged) listeners.forEach((l) => l());
  },
  /** Subscribe to coarse (active/speaking) changes. For useSyncExternalStore. */
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Reset to idle — call when the tour unmounts so a remount starts clean. */
  reset(): void {
    snapshot = { active: false, conversing: false, speaking: false, mouth: 0 };
    listeners.forEach((l) => l());
  },
};
