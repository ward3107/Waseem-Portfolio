// A tiny framework-agnostic store bridging the DOM audio tour to the 3D
// talking head — the same pattern as scrollStore, and for the same reason: the
// R3F render loop reads the mouth openness every frame (60+ Hz), so it must be
// a plain mutable value the head can read inside useFrame with zero React
// re-renders. DOM widgets that only care about the coarse flags subscribe via
// useSyncExternalStore instead.
//
//   - `active`     — the narration tour is on (a face should be shown).
//   - `conversing` — a live voice conversation with the agent is connected. The
//                    face is shown while either `active` or `conversing` is set,
//                    and the conversation drives the mouth (the narration yields).
//   - `speaking`   — the current source (narration clip or agent) is speaking.
//   - `mouth`      — live mouth openness 0 (closed) → 1 (wide), from the
//                    narration's amplitude, the agent's output volume, or a
//                    procedural talking envelope as a fallback.
//   - `present`    — the AudioTour component is mounted and has registered its
//                    controls, so a remote control surface (the header button)
//                    may show and drive it. False on pages without the tour.
//   - `playing`    — the narration clip is currently playing (not paused/ended).
//   - `muted`      — the narration is muted.
//
// The tour's UI lives in the header (see AudioHeaderControl) rather than as a
// floating rail, so AudioTour registers a small controls object here and the
// header calls through it — keeping AudioTour the single owner of the audio
// element and all of its logic.

export interface AudioTourSnapshot {
  active: boolean;
  conversing: boolean;
  speaking: boolean;
  mouth: number;
  present: boolean;
  playing: boolean;
  muted: boolean;
}

/** Imperative handle AudioTour registers so a detached control (the header
 *  button) can drive playback without owning the audio element. */
export interface AudioTourControls {
  start(): void;
  togglePlay(): void;
  toggleMute(): void;
  close(): void;
}

let snapshot: AudioTourSnapshot = {
  active: false,
  conversing: false,
  speaking: false,
  mouth: 0,
  present: false,
  playing: false,
  muted: true,
};
const listeners = new Set<() => void>();
let controls: AudioTourControls | null = null;

export const audioTourStore = {
  /** Read the current snapshot. Safe to call inside useFrame. */
  get(): AudioTourSnapshot {
    return snapshot;
  },
  /**
   * Merge a partial update and notify subscribers. `mouth` changes every frame
   * but is not part of the coarse subscription contract — DOM subscribers only
   * re-render when a coarse flag flips (see the equality check), so per-frame
   * mouth writes stay free.
   */
  set(patch: Partial<AudioTourSnapshot>): void {
    const next = { ...snapshot, ...patch };
    const coarseChanged =
      next.active !== snapshot.active ||
      next.conversing !== snapshot.conversing ||
      next.speaking !== snapshot.speaking ||
      next.present !== snapshot.present ||
      next.playing !== snapshot.playing ||
      next.muted !== snapshot.muted;
    snapshot = next;
    if (coarseChanged) listeners.forEach((l) => l());
  },
  /** Subscribe to coarse changes. For useSyncExternalStore. */
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** AudioTour registers its imperative controls on mount; returns an
   *  unregister for cleanup. While registered, `present` is true. */
  registerControls(c: AudioTourControls): () => void {
    controls = c;
    audioTourStore.set({ present: true });
    return () => {
      if (controls === c) {
        controls = null;
        audioTourStore.set({ present: false, active: false, playing: false });
      }
    };
  },
  // Detached control surface (the header) calls these; they no-op until
  // AudioTour has registered.
  start(): void {
    controls?.start();
  },
  togglePlay(): void {
    controls?.togglePlay();
  },
  toggleMute(): void {
    controls?.toggleMute();
  },
  close(): void {
    controls?.close();
  },
  /** Reset to idle — call when the tour unmounts so a remount starts clean. */
  reset(): void {
    snapshot = {
      active: false,
      conversing: false,
      speaking: false,
      mouth: 0,
      present: false,
      playing: false,
      muted: true,
    };
    listeners.forEach((l) => l());
  },
};
