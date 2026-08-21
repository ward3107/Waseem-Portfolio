import React, { useEffect, useRef } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import {
  Center,
  Float,
  Text3D,
  MeshTransmissionMaterial,
  Environment,
  Lightformer,
} from '@react-three/drei';
import { Group, MathUtils } from 'three';
import { scrollStore } from '../scrollStore';
import type { QualityTier } from '../useQualityTier';

/**
 * Chapter 1 — "The Craftsman". A refractive glass brand monogram (the "W") that
 * is meant to feel alive and aggressive rather than a passive backdrop:
 *
 *   - it idles with a lively spin and floats,
 *   - scrolling injects spin — the faster you scroll, the harder it whips
 *     around — and on the way out it warps back into depth while spinning
 *     instead of quietly fading, then flies back when you scroll up,
 *   - it leans sharply toward the cursor, and
 *   - you can grab it (click-drag) to fling it spinning with momentum.
 *
 * The monogram reuses the subsetted "W" typeface from the legacy Logo3D
 * (/fonts/logo-font.json), so no new font asset ships. Rendered inside the
 * shared <Canvas>; a <Suspense> in Scene.tsx isolates the one-time font load.
 */
const HeroChapter: React.FC<{ tier: QualityTier }> = ({ tier }) => {
  const group = useRef<Group>(null);
  const pointer = useThree((s) => s.pointer);
  const high = tier === 'high';

  // Spin state. The rotation TRACKS scroll directly (progress × a fixed gain)
  // instead of integrating scroll velocity — velocity injection made a fast
  // flick whip the letter around uncontrollably. Direct coupling means the
  // spin speed is exactly proportional to how fast you scroll, perfectly
  // reversible, and it settles the moment the page does. A slow idle drift
  // keeps it alive when resting, and drag-flings decay smoothly on top.
  const spin = useRef(0);
  const fling = useRef(0); // angular velocity from drag-flings only
  const flingOffset = useRef(0);
  const tiltX = useRef(0);
  const tiltY = useRef(0);

  // Drag-to-fling. The mesh's onPointerDown starts a drag; window listeners
  // handle move/up so a fast drag that leaves the letter still tracks.
  const dragging = useRef(false);
  const lastDragX = useRef(0);
  useEffect(() => {
    const move = (ev: PointerEvent) => {
      if (!dragging.current) return;
      const dx = ev.clientX - lastDragX.current;
      lastDragX.current = ev.clientX;
      fling.current += dx * 0.02; // fling proportional to drag speed
    };
    const up = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = 'auto';
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      document.body.style.cursor = 'auto';
    };
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const { progress } = scrollStore.get();

    // Fling momentum decays smoothly; accumulate it as an angle offset.
    fling.current *= Math.exp(-2.5 * delta);
    flingOffset.current += fling.current * delta;

    // Target = slow idle drift + direct scroll coupling + fling.
    const idleDrift = state.clock.elapsedTime * 0.25;
    const scrollSpin = progress * 7; // ~1.1 turns over the whole journey
    const spinTarget = idleDrift + scrollSpin + flingOffset.current;
    spin.current = MathUtils.lerp(spin.current, spinTarget, 1 - Math.exp(-5 * delta));

    // Aggressive, snappy lean toward the cursor.
    const eased = 1 - Math.exp(-7 * delta);
    tiltY.current = MathUtils.lerp(tiltY.current, pointer.x * -0.9, eased);
    tiltX.current = MathUtils.lerp(tiltX.current, pointer.y * 0.6, eased);
    g.rotation.y = spin.current + tiltY.current;
    g.rotation.x = tiltX.current;

    // Presence timeline, tier-dependent:
    //   high — the hero film carries the top of the page, so the live W enters
    //   in a crossfade exactly as the film's resting W fades (HeroFilm's fade
    //   window), then warps back into depth through the services transition.
    //   low — no film on phones; the W is present from the top as before.
    let presence: number;
    if (high) {
      const enter = MathUtils.clamp((progress - 0.1) / 0.05, 0, 1);
      const exitP = MathUtils.clamp(1 - Math.max(0, progress - 0.17) * 7, 0, 1);
      presence = enter * exitP;
    } else {
      presence = MathUtils.clamp(1 - Math.max(0, progress - 0.05) * 9, 0, 1);
    }
    g.visible = presence > 0.01;
    const exit = 1 - presence;
    g.position.z = MathUtils.lerp(g.position.z, -exit * 13, eased);
    g.scale.setScalar(MathUtils.lerp(g.scale.x, 0.55 + presence * 0.55, eased));
  });

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    dragging.current = true;
    lastDragX.current = e.clientX;
    document.body.style.cursor = 'grabbing';
  };
  const onOver = () => {
    if (!dragging.current) document.body.style.cursor = 'grab';
  };
  const onOut = () => {
    if (!dragging.current) document.body.style.cursor = 'auto';
  };

  return (
    <group ref={group}>
      {/* Float adds gentle life on top of the driven spin — kept subtle so the
          scroll/drag spin stays the dominant motion. */}
      <Float speed={high ? 1.8 : 1.4} rotationIntensity={0.35} floatIntensity={high ? 1.1 : 0.8}>
        <Center>
          <Text3D
            font="/fonts/logo-font.json"
            size={2.2}
            height={0.6}
            curveSegments={high ? 10 : 6}
            bevelEnabled
            bevelThickness={0.09}
            bevelSize={0.06}
            bevelSegments={high ? 6 : 3}
            onPointerDown={onDown}
            onPointerOver={onOver}
            onPointerOut={onOut}
          >
            W
            {high ? (
              // Full glass: transmission re-renders the scene each frame — the
              // premium look, but the heaviest material, so desktop only.
              <MeshTransmissionMaterial
                samples={6}
                resolution={256}
                thickness={0.8}
                roughness={0.12}
                transmission={1}
                ior={1.4}
                chromaticAberration={0.12}
                anisotropy={0.2}
                distortion={0.3}
                distortionScale={0.4}
                temporalDistortion={0.1}
                color="#A78BFA"
                attenuationColor="#7965C1"
                attenuationDistance={1.5}
              />
            ) : (
              // Mobile: a glowing metallic crystal. No per-frame transmission
              // buffer; emissive keeps it luminous, the environment gives it
              // reflections. Cheap and smooth on phone GPUs.
              <meshStandardMaterial
                color="#A78BFA"
                metalness={0.6}
                roughness={0.18}
                emissive="#7965C1"
                emissiveIntensity={0.6}
              />
            )}
          </Text3D>
        </Center>
      </Float>

      {/* Brand-coloured edge highlights on the glass. */}
      <pointLight position={[3, 3, 4]} intensity={40} color="#00E5FF" />
      <pointLight position={[-4, -2, 2]} intensity={28} color="#7965C1" />

      {/* Procedural studio environment — no network fetch, baked once
          (frames=1) for reflections/refraction. Lighter on the low tier. */}
      <Environment resolution={high ? 128 : 64} frames={1}>
        <Lightformer intensity={2} position={[0, 2, 4]} scale={[8, 8, 1]} color="#00E5FF" />
        <Lightformer intensity={1.6} position={[-5, -1, -3]} scale={[6, 6, 1]} color="#7965C1" />
        {high && (
          <Lightformer intensity={1.2} position={[5, 1, -2]} scale={[6, 6, 1]} color="#E3D095" />
        )}
      </Environment>
    </group>
  );
};

export default HeroChapter;
