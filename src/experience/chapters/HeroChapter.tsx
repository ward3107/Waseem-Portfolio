import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
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

/**
 * Chapter 1 — "The Craftsman". A refractive glass brand monogram (the "W")
 * floating in a dark studio, lit by brand-coloured accent lights and a small
 * procedural environment so the glass has something to refract and reflect.
 *
 * The monogram reuses the same subsetted "W" typeface as the legacy Logo3D
 * (/fonts/logo-font.json), so no new font asset ships. It presents while the
 * hero chapter fills the viewport and eases out (scale + visibility) as the
 * journey scrolls into the next chapter, so it never lingers awkwardly.
 *
 * Everything here renders inside the shared <Canvas>; a <Suspense> around this
 * component (in Scene.tsx) isolates the one-time font load so the rest of the
 * scene never blanks while it streams in.
 */
const HeroChapter: React.FC = () => {
  const group = useRef<Group>(null);
  const pointer = useThree((s) => s.pointer);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    // Present in chapter 1, gone by the time chapter 2 is centred. progress is
    // whole-journey [0,1]; the hero owns the first 1/6, so fade across it.
    const { progress } = scrollStore.get();
    const presence = MathUtils.clamp(1 - progress * 6, 0, 1);
    g.visible = presence > 0.01;
    const eased = 1 - Math.exp(-3 * delta);
    g.scale.setScalar(MathUtils.lerp(g.scale.x, 0.7 + presence * 0.3, eased));

    // Gentle counter-parallax against the camera for depth.
    g.rotation.y = MathUtils.lerp(g.rotation.y, pointer.x * -0.3, eased);
    g.rotation.x = MathUtils.lerp(g.rotation.x, pointer.y * 0.2, eased);
  });

  return (
    <group ref={group}>
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.7}>
        <Center>
          <Text3D
            font="/fonts/logo-font.json"
            size={2.2}
            height={0.6}
            curveSegments={10}
            bevelEnabled
            bevelThickness={0.09}
            bevelSize={0.06}
            bevelSegments={6}
          >
            W
            <MeshTransmissionMaterial
              samples={6}
              resolution={256}
              thickness={0.8}
              roughness={0.12}
              transmission={1}
              ior={1.4}
              chromaticAberration={0.06}
              anisotropy={0.1}
              distortion={0.2}
              distortionScale={0.3}
              temporalDistortion={0.05}
              color="#A78BFA"
              attenuationColor="#7965C1"
              attenuationDistance={1.5}
            />
          </Text3D>
        </Center>
      </Float>

      {/* Brand-coloured edge highlights on the glass. */}
      <pointLight position={[3, 3, 4]} intensity={40} color="#00E5FF" />
      <pointLight position={[-4, -2, 2]} intensity={28} color="#7965C1" />

      {/* Procedural studio environment — no network fetch. Baked once (frames=1)
          for the reflections/refraction the transmission material samples. */}
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2} position={[0, 2, 4]} scale={[8, 8, 1]} color="#00E5FF" />
        <Lightformer intensity={1.6} position={[-5, -1, -3]} scale={[6, 6, 1]} color="#7965C1" />
        <Lightformer intensity={1.2} position={[5, 1, -2]} scale={[6, 6, 1]} color="#E3D095" />
      </Environment>
    </group>
  );
};

export default HeroChapter;
