import type { Vector3Tuple } from 'three';

/**
 * The storyboard is the single source of truth for the scroll-driven journey.
 * Each chapter owns a slice of the total scroll and a camera keyframe the rig
 * eases toward while that slice is active. Phase 1 wires the timing, camera
 * path, and DOM scaffold; later phases drop real 3D content and the section
 * copy into each chapter without touching this contract.
 *
 * `anchor` maps a chapter to the existing in-page nav hrefs (see NAV_LINKS in
 * src/constants.ts) so deep links like `/#what-i-do` can scrub the timeline to
 * the right place in a later phase.
 */
export interface Chapter {
  /** Stable id used for keys, DOM ids, and debugging. */
  id: string;
  /** Human-readable label shown in the Phase 1 scaffold and dev indicator. */
  label: string;
  /** i18n key for the chapter's display title (added to translations later). */
  titleKey: string;
  /** Existing hash anchor this chapter corresponds to, if any. */
  anchor?: string;
  /** Camera position at the moment this chapter is centered. */
  camera: Vector3Tuple;
  /** Point the camera looks at while this chapter is centered. */
  lookAt: Vector3Tuple;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'hero',
    label: 'Hero — The Craftsman',
    titleKey: 'exp_chapter_hero',
    anchor: '#hero',
    camera: [0, 0, 6],
    lookAt: [0, 0, 0],
  },
  {
    id: 'services',
    label: 'Services — What I build',
    titleKey: 'exp_chapter_services',
    anchor: '#what-i-do',
    camera: [3, 0.5, 5],
    lookAt: [0, 0, -2],
  },
  {
    id: 'ai',
    label: 'AI & Automation',
    titleKey: 'exp_chapter_ai',
    anchor: '#ai-automation',
    camera: [-2, 1, 4],
    lookAt: [0, 0, -4],
  },
  {
    id: 'projects',
    label: 'Projects — The Work',
    titleKey: 'exp_chapter_projects',
    anchor: '#projects',
    camera: [0, -0.5, 7],
    lookAt: [0, 0, -6],
  },
  {
    id: 'trust',
    label: 'Trust — Reviews & Reach',
    titleKey: 'exp_chapter_trust',
    anchor: '#reviews',
    camera: [2, 1.5, 5],
    lookAt: [0, 0, -3],
  },
  {
    id: 'contact',
    label: 'Contact — Let’s build',
    titleKey: 'exp_chapter_contact',
    anchor: '#contact',
    camera: [0, 0, 5],
    lookAt: [0, 0, -1],
  },
];

/** Number of full-viewport pages the journey spans (drives scroll height). */
export const TOTAL_CHAPTERS = CHAPTERS.length;

/**
 * Map a whole-journey progress value [0,1] to the active chapter index and the
 * progress within that chapter. Pure — safe to call every frame.
 */
export function resolveChapter(progress: number): {
  chapter: number;
  chapterProgress: number;
} {
  const clamped = Math.min(0.999999, Math.max(0, progress));
  const scaled = clamped * TOTAL_CHAPTERS;
  const chapter = Math.floor(scaled);
  return { chapter, chapterProgress: scaled - chapter };
}
