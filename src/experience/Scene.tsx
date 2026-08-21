import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { Vector3, MathUtils, type Mesh, type Group } from 'three';
import { scrollStore } from './scrollStore';
import { CHAPTERS } from './storyboard';

// Brand palette (mirrors tailwind.config.js) so the 3D world reads as the
// same brand as the DOM site.
const BRAND_PURPLE = '#7965C1';
const BRAND_CYAN = '#00E5FF';

/**
 * Phase 1 placeholder scene. It exists to PROVE the plumbing end to end:
 * scroll progress from the store drives a camera rig along the storyboard's
 * per-chapter keyframes, with light mouse parallax and idle float. The single
 * refractive-looking monogram stand-in and the sparkle field are intentionally
 * minimal — real per-chapter content (glass monogram, service constellation,
 * project fly-through, …) replaces this in later phases without changing the
 * scroll/camera contract.
 */
const Scene: React.FC = () => {
  const camera = useThree((s) => s.camera);
  const monogram = useRef<Mesh>(null);
  const world = useRef<Group>(null);

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
    const { progress } = scrollStore.get();
    const last = CHAPTERS.length - 1;
    const seg = progress * last;
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

    // Idle life in the world so it never feels frozen.
    if (monogram.current) {
      monogram.current.rotation.y += delta * 0.25;
      monogram.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
    if (world.current) {
      world.current.rotation.y = progress * Math.PI * 0.5;
    }
  });

  return (
    <group ref={world}>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 6, 6]} intensity={80} color={BRAND_CYAN} />
      <pointLight position={[-6, -3, -4]} intensity={60} color={BRAND_PURPLE} />

      <Float speed={1.4} rotationIntensity={0.6} floatIntensity={0.8}>
        <mesh ref={monogram}>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshStandardMaterial
            color={BRAND_PURPLE}
            emissive={BRAND_PURPLE}
            emissiveIntensity={0.35}
            roughness={0.25}
            metalness={0.6}
            wireframe
          />
        </mesh>
      </Float>

      <Sparkles
        count={60}
        scale={[12, 8, 12]}
        size={2}
        speed={0.3}
        opacity={0.5}
        color={BRAND_CYAN}
      />
    </group>
  );
};

export default Scene;
