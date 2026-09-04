import React, { useMemo, useRef, useSyncExternalStore } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  Points,
  PointsMaterial,
  type Group,
} from 'three';
import { audioTourStore } from '../audioTourStore';
import type { QualityTier } from '../useQualityTier';
import { getPrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

/**
 * The "assistant" — an ABSTRACT face made of glowing particles, the same look as
 * the brand "W" monogram (a Points cloud with additive blending), not a solid
 * or realistic head. Two eye clusters, a head outline, and a mouth that opens
 * and closes with the live audio: it reads the narration/agent amplitude from
 * audioTourStore every frame (never React state) and spreads the mouth points
 * apart in time with speech, plus idle life (gentle sway + the occasional blink).
 *
 * It renders in its own tiny transparent <Canvas> pinned above the audio-tour
 * controls, mounted only while the tour is active OR a voice call is connected,
 * and skipped under reduced-motion. Purely decorative: pointer-events-none.
 */

// Brand palette (mirrors tailwind.config.js / MorphField).
const HEAD_COLOR = '#A78BFA';
const EYE_COLOR = '#00E5FF';
const MOUTH_COLOR = '#E3D095';

// Face geometry (local units; the head spans ~±1.1).
const EYE_CY = 0.34;
const EYE_DX = 0.4;
const EYE_R = 0.15;
const MOUTH_CY = -0.46;
const MOUTH_RX = 0.42;
const MOUTH_RY_CLOSED = 0.03;
const MOUTH_RY_OPEN = 0.5;

type FaceData = {
  geometry: BufferGeometry;
  rest: Float32Array; // base positions (x kept, y recomputed for eyes/mouth)
  kind: Uint8Array; // 0 head, 1 eye, 2 mouth
  aux: Float32Array; // mouth: sin factor; eye: dy from eye-centre; head: 0
};

function buildFace(tier: QualityTier): FaceData {
  const high = tier === 'high';
  const headCount = high ? 340 : 170; // outline rings
  const eyeCount = high ? 70 : 38; // per eye
  const mouthCount = high ? 170 : 90;
  const total = headCount + eyeCount * 2 + mouthCount;

  const pos = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);
  const kind = new Uint8Array(total);
  const aux = new Float32Array(total);

  const head = new Color(HEAD_COLOR);
  const eye = new Color(EYE_COLOR);
  const mouth = new Color(MOUTH_COLOR);

  let o = 0;
  const put = (x: number, y: number, z: number, c: Color, k: number, a: number) => {
    pos[o * 3] = x;
    pos[o * 3 + 1] = y;
    pos[o * 3 + 2] = z;
    col[o * 3] = c.r;
    col[o * 3 + 1] = c.g;
    col[o * 3 + 2] = c.b;
    kind[o] = k;
    aux[o] = a;
    o++;
  };

  // Head — two faint elliptical rings suggesting a face, not filling it.
  for (let i = 0; i < headCount; i++) {
    const ang = (i / headCount) * Math.PI * 2;
    const ring = i % 2 === 0 ? 1 : 0.9;
    const jitter = 0.02;
    const x = Math.cos(ang) * 1.0 * ring + (Math.random() - 0.5) * jitter;
    const y = Math.sin(ang) * 1.2 * ring + (Math.random() - 0.5) * jitter;
    const z = (Math.random() - 0.5) * 0.12;
    put(x, y, z, head, 0, 0);
  }

  // Eyes — two small filled discs of points; aux holds each point's dy from the
  // eye centre so a blink can squash them vertically.
  for (const dir of [-1, 1]) {
    for (let i = 0; i < eyeCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * EYE_R;
      const dx = Math.cos(a) * r;
      const dy = Math.sin(a) * r;
      const z = (Math.random() - 0.5) * 0.1;
      put(dir * EYE_DX + dx, EYE_CY + dy, z, eye, 1, dy);
    }
  }

  // Mouth — an ellipse outline; aux holds sin(angle) so we can grow its vertical
  // radius with the audio (closed = a line, open = an oval).
  for (let i = 0; i < mouthCount; i++) {
    const ang = (i / mouthCount) * Math.PI * 2;
    const s = Math.sin(ang);
    const x = Math.cos(ang) * MOUTH_RX + (Math.random() - 0.5) * 0.02;
    const y = MOUTH_CY + s * MOUTH_RY_CLOSED;
    const z = (Math.random() - 0.5) * 0.08;
    put(x, y, z, mouth, 2, s);
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(pos, 3));
  geo.setAttribute('color', new BufferAttribute(col, 3));
  return { geometry: geo, rest: pos.slice(), kind, aux };
}

const Face: React.FC<{ tier: QualityTier }> = ({ tier }) => {
  const group = useRef<Group>(null);
  const points = useRef<Points>(null);
  const blink = useRef({ next: 1.5, until: 0 });
  const openRef = useRef(0);

  const { geometry, material, rest, kind, aux } = useMemo(() => {
    const face = buildFace(tier);
    const mat = new PointsMaterial({
      size: tier === 'high' ? 0.05 : 0.07,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    return { geometry: face.geometry, material: mat, rest: face.rest, kind: face.kind, aux: face.aux };
  }, [tier]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { mouth: openness, speaking } = audioTourStore.get();

    // Ease the mouth opening toward the live amplitude.
    openRef.current = MathUtils.lerp(openRef.current, openness, 0.4);
    const ry = MOUTH_RY_CLOSED + openRef.current * MOUTH_RY_OPEN;

    // Blink on an irregular cadence.
    const b = blink.current;
    if (t > b.next && t > b.until) {
      b.until = t + 0.12;
      b.next = t + 2.6 + Math.random() * 3.6;
    }
    const blinkScale = t < b.until ? 0.12 : 1;

    const obj = points.current;
    if (obj) {
      const arr = (obj.geometry.attributes.position as BufferAttribute).array as Float32Array;
      for (let i = 0; i < kind.length; i++) {
        if (kind[i] === 2) {
          // mouth: y = centre + growing vertical radius * sin(angle)
          arr[i * 3 + 1] = MOUTH_CY + ry * aux[i];
        } else if (kind[i] === 1) {
          // eye: squash toward its centre on a blink
          arr[i * 3 + 1] = EYE_CY + aux[i] * blinkScale;
        } else {
          arr[i * 3 + 1] = rest[i * 3 + 1];
        }
      }
      (obj.geometry.attributes.position as BufferAttribute).needsUpdate = true;
    }

    // Idle life: gentle sway, a touch livelier while speaking.
    if (group.current) {
      const energy = speaking ? 1 : 0.5;
      group.current.rotation.y = Math.sin(t * 0.5) * 0.25 * energy + state.pointer.x * 0.15;
      group.current.rotation.x = Math.sin(t * 0.8 + 1) * 0.08 * energy;
      group.current.position.y = Math.sin(t * 1.3) * 0.03;
    }
  });

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} material={material} />
    </group>
  );
};

const HeadCanvas: React.FC<{ tier: QualityTier }> = ({ tier }) => (
  <div
    className="pointer-events-none fixed bottom-[4.75rem] left-4 z-40 h-24 w-24 overflow-hidden rounded-full border border-brand-cyan/25 bg-slate-950/50 shadow-lg shadow-brand-cyan/10 backdrop-blur-sm sm:h-32 sm:w-32"
    aria-hidden="true"
  >
    <Canvas
      dpr={tier === 'high' ? [1, 1.5] : [1, 1]}
      camera={{ position: [0, 0, 3.6], fov: 40, near: 0.1, far: 20 }}
      gl={{ antialias: tier === 'high', alpha: true, powerPreference: 'low-power' }}
    >
      <Face tier={tier} />
    </Canvas>
  </div>
);

/**
 * Mount gate: renders the head only while the narration tour is on OR a live
 * agent conversation is connected, so its WebGL context exists only on opt-in.
 */
const subscribe = (cb: () => void) => audioTourStore.subscribe(cb);
const getShown = () => {
  const s = audioTourStore.get();
  return s.active || s.conversing;
};

const TalkingHead: React.FC<{ tier: QualityTier }> = ({ tier }) => {
  const active = useSyncExternalStore(subscribe, getShown, () => false);
  const reduced = useMemo(() => getPrefersReducedMotion(), []);
  if (!active || reduced) return null;
  return <HeadCanvas tier={tier} />;
};

export default TalkingHead;
