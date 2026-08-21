import React, { Suspense, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { Vector3, MathUtils, type Group } from 'three';
import { scrollStore } from './scrollStore';
import { CHAPTERS } from './storyboard';
import HeroChapter from './chapters/HeroChapter';
import MorphField from './MorphField';
import ProjectsScene from './chapters/ProjectsScene';
import type { QualityTier } from './useQualityTier';

// Brand palette (mirrors tailwind.config.js) so the 3D world reads as the
// same brand as the DOM site.
const BRAND_PURPLE = '#7965C1';
const BRAND_CYAN = '#00E5FF';

/**
 * The persistent 3D world. It owns the two things every chapter shares:
 *   1. the scroll-driven camera rig (eased along the storyboard keyframes with
 *      light mouse parallax), and
 *   2. ambient atmosphere (dust sparkles + fill lights).
 *
 * Per-chapter content mounts inside. Phase 2 adds the Hero chapter (glass
 * monogram); Phases 3–4 add the remaining chapters the same way, each isolated
 * behind its own <Suspense> so an asset load never blanks the whole canvas.
 */
const Scene: React.FC<{ tier: QualityTier }> = ({ tier }) => {
  const camera = useThree((s) => s.camera);
  // The morphing field rides the camera's focus point. Left at the world
  // origin it slid out of frame as the per-chapter camera moves panned away,
  // which read as the shape wandering off rather than presenting itself.
  const fieldAnchor = useRef<Group>(null);

  // Precompute Vector3 keyframes once from the storyboard tuples.
  const keyframes = useMemo(
    () => ({
      cameras: CHAPTERS.map((c) => new Vector3(...c.camera)),
      looks: CHAPTERS.map((c) => new Vector3(...c.lookAt)),
    }),
    []
  );

  // Reusable scratch vectors — never allocate inside useFrame.
  const camTarget = useMemo(() => new Vector3(), []);
  const lookTarget = useMemo(() => new Vector3(), []);

  useFrame((state, delta) => {
    const { journey } = scrollStore.get();
    const last = CHAPTERS.length - 1;
    const seg = journey * last;
    const i = Math.min(last - 1, Math.max(0, Math.floor(seg)));
    const f = MathUtils.clamp(seg - i, 0, 1);

    // Interpolate the camera keyframe for the current scroll position.
    camTarget.lerpVectors(keyframes.cameras[i], keyframes.cameras[i + 1], f);
    lookTarget.lerpVectors(keyframes.looks[i], keyframes.looks[i + 1], f);

    // Mouse parallax — nudge the target by the normalized pointer.
    camTarget.x += state.pointer.x * 0.35;
    camTarget.y += state.pointer.y * 0.25;

    // Frame-rate-independent easing toward the target (no snapping on lag).
    const a = 1 - Math.exp(-4 * delta);
    camera.position.lerp(camTarget, a);
    camera.lookAt(lookTarget);

    // Keep the field composed at the centre of frame, whatever the camera does.
    fieldAnchor.current?.position.lerp(lookTarget, a);
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[6, 6, 6]} intensity={60} color={BRAND_CYAN} />
      <pointLight position={[-6, -3, -4]} intensity={40} color={BRAND_PURPLE} />

      {/* The through-line: one particle cloud that re-forms per chapter, so the
          world is never empty between beats. Suspense isolates its font load. */}
      <group ref={fieldAnchor} scale={0.7}>
        <Suspense fallback={null}>
          <MorphField tier={tier} />
        </Suspense>
      </group>

      {/* Chapter 1 — glass monogram. Suspense isolates the one-time font load. */}
      <Suspense fallback={null}>
        <HeroChapter tier={tier} />
      </Suspense>

      {/* Chapter 4 — projects fly-through. High tier only: on phones the DOM
          project cards (ProjectsOverlay) carry this chapter instead, which fits
          a portrait viewport far better than a wide 3D fan. */}
      {tier === 'high' && (
        <Suspense fallback={null}>
          <ProjectsScene />
        </Suspense>
      )}

      {/* Ambient dust, well behind the morphing field so it reads as depth. */}
      <Sparkles
        count={tier === 'high' ? 28 : 12}
        scale={[14, 9, 14]}
        size={2}
        speed={0.3}
        opacity={0.5}
        color={BRAND_CYAN}
      />
    </group>
  );
};

export default Scene;
