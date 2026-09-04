import React, { Suspense, useMemo, useRef, useSyncExternalStore } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Lightformer, MeshTransmissionMaterial } from '@react-three/drei';
import { MathUtils, type Group, type Mesh } from 'three';
import { audioTourStore } from '../audioTourStore';
import type { QualityTier } from '../useQualityTier';
import { getPrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

/**
 * The "assistant" — a small, glassy 3D face that lip-syncs to the audio tour.
 *
 * It reads audioTourStore every frame (never React state — the mouth moves at
 * 60Hz) and maps the live narration amplitude onto a jaw/mouth that opens and
 * closes, plus idle life: gentle float, a slow head sway, and the occasional
 * blink. The material mirrors the hero monogram (glass transmission on desktop,
 * a glowing emissive crystal on phones) so the bot reads as the same brand.
 *
 * It renders in its own tiny transparent <Canvas> pinned above the audio-tour
 * controls, mounted only while the tour is active (so no second WebGL context
 * exists until the visitor opts in) and skipped entirely under reduced-motion.
 * Purely decorative: pointer-events-none, aria-hidden — the real controls and
 * text live elsewhere.
 */

// Brand palette (mirrors tailwind.config.js / the hero glass).
const PURPLE_LIGHT = '#A78BFA';
const PURPLE = '#7965C1';
const CYAN = '#00E5FF';
const GOLD = '#E3D095';

const Face: React.FC<{ tier: QualityTier }> = ({ tier }) => {
  const high = tier === 'high';
  const head = useRef<Group>(null);
  const mouth = useRef<Mesh>(null);
  const leftEye = useRef<Mesh>(null);
  const rightEye = useRef<Mesh>(null);
  const blink = useRef({ next: 1.5, until: 0 });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { mouth: openness, speaking } = audioTourStore.get();

    // Mouth: ease the scale toward the live openness. A tiny floor keeps a lip
    // line visible when closed; speaking widens the range.
    if (mouth.current) {
      const target = 0.06 + openness * 0.9;
      mouth.current.scale.y = MathUtils.lerp(mouth.current.scale.y, target, 0.4);
      // A subtle width flex on louder moments makes it feel spoken, not hinged.
      mouth.current.scale.x = MathUtils.lerp(mouth.current.scale.x, 1 + openness * 0.15, 0.3);
    }

    // Head: slow sway, leaning a touch more alive while speaking.
    if (head.current) {
      const energy = speaking ? 1 : 0.45;
      head.current.rotation.y = Math.sin(t * 0.6) * 0.18 * energy;
      head.current.rotation.x = Math.sin(t * 0.9 + 1) * 0.06 * energy;
      // Slight nods synced to loud syllables.
      head.current.position.y = Math.sin(t * 1.4) * 0.02 - openness * 0.03;
    }

    // Blink: snap the eyes near-shut briefly on an irregular cadence.
    const b = blink.current;
    if (t > b.next && t > b.until) {
      b.until = t + 0.12;
      b.next = t + 2.6 + Math.random() * 3.4;
    }
    const eyeScale = t < b.until ? 0.12 : 1;
    if (leftEye.current) leftEye.current.scale.y = MathUtils.lerp(leftEye.current.scale.y, eyeScale, 0.5);
    if (rightEye.current) rightEye.current.scale.y = MathUtils.lerp(rightEye.current.scale.y, eyeScale, 0.5);
  });

  const seg = high ? 48 : 24;

  return (
    <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={head}>
        {/* Head — an egg-ish glass form, same material story as the hero W. */}
        <mesh scale={[1, 1.16, 0.9]}>
          <sphereGeometry args={[1, seg, seg]} />
          {high ? (
            <MeshTransmissionMaterial
              samples={4}
              resolution={192}
              thickness={0.9}
              roughness={0.14}
              transmission={1}
              ior={1.4}
              chromaticAberration={0.1}
              anisotropy={0.15}
              distortion={0.2}
              distortionScale={0.3}
              temporalDistortion={0.08}
              color={PURPLE_LIGHT}
              attenuationColor={PURPLE}
              attenuationDistance={1.6}
            />
          ) : (
            <meshStandardMaterial
              color={PURPLE_LIGHT}
              metalness={0.6}
              roughness={0.2}
              emissive={PURPLE}
              emissiveIntensity={0.6}
              transparent
              opacity={0.92}
            />
          )}
        </mesh>

        {/* Eyes — glowing cyan, they blink. */}
        <mesh ref={leftEye} position={[-0.32, 0.24, 0.74]}>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
        <mesh ref={rightEye} position={[0.32, 0.24, 0.74]}>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={2.4} toneMapped={false} />
        </mesh>

        {/* Mouth — a rounded gold bar that scales open with the narration. */}
        <mesh ref={mouth} position={[0, -0.42, 0.72]}>
          <capsuleGeometry args={[0.08, 0.34, 4, 12]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      </group>

      {/* Brand rim lights + a baked studio env for the glass reflections. */}
      <pointLight position={[3, 3, 4]} intensity={22} color={CYAN} />
      <pointLight position={[-4, -2, 2]} intensity={16} color={PURPLE} />
      <Environment resolution={high ? 96 : 48} frames={1}>
        <Lightformer intensity={2} position={[0, 2, 4]} scale={[6, 6, 1]} color={CYAN} />
        <Lightformer intensity={1.4} position={[-4, -1, -3]} scale={[5, 5, 1]} color={PURPLE} />
        {high && <Lightformer intensity={1} position={[4, 1, -2]} scale={[5, 5, 1]} color={GOLD} />}
      </Environment>
    </Float>
  );
};

const HeadCanvas: React.FC<{ tier: QualityTier }> = ({ tier }) => (
  <div
    className="pointer-events-none fixed bottom-[4.75rem] left-4 z-40 h-24 w-24 overflow-hidden rounded-full border border-brand-cyan/25 bg-slate-900/40 shadow-lg shadow-brand-cyan/10 backdrop-blur-sm sm:h-32 sm:w-32"
    aria-hidden="true"
  >
    <Canvas
      dpr={tier === 'high' ? [1, 1.5] : [1, 1]}
      camera={{ position: [0, 0, 4], fov: 34, near: 0.1, far: 20 }}
      gl={{ antialias: tier === 'high', alpha: true, powerPreference: 'low-power' }}
    >
      <ambientLight intensity={0.6} />
      <Suspense fallback={null}>
        <Face tier={tier} />
      </Suspense>
    </Canvas>
  </div>
);

/**
 * Mount gate: renders the head only while the tour is active, so its WebGL
 * context is created on opt-in and torn down when the tour is closed. Reads the
 * coarse `active` flag via useSyncExternalStore (not the per-frame mouth value).
 */
const subscribe = (cb: () => void) => audioTourStore.subscribe(cb);
// Shown while the narration tour is on OR a live agent conversation is up — the
// same face lip-syncs to whichever is speaking.
const getShown = () => {
  const s = audioTourStore.get();
  return s.active || s.conversing;
};

const TalkingHead: React.FC<{ tier: QualityTier }> = ({ tier }) => {
  const active = useSyncExternalStore(subscribe, getShown, () => false);
  // A lip-syncing, blinking face is motion; honour the reduced-motion setting.
  const reduced = useMemo(() => getPrefersReducedMotion(), []);
  if (!active || reduced) return null;
  return <HeadCanvas tier={tier} />;
};

export default TalkingHead;
