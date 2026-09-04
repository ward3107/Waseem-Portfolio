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
 * The "assistant" — an ABSTRACT face made of living particles, the same additive
 * Points look as the brand "W" monogram, and (like the W) always in gentle
 * motion: every dot drifts and swirls around its place while the whole cloud
 * sways, so it reads as alive rather than a static graphic. Two eye clusters, a
 * faint elliptical head outline, and a mouth built from an ellipse of points
 * whose vertical radius grows with the live audio — so it lip-syncs to the
 * narration and the agent, with the occasional blink.
 *
 * Placement follows the moment: while the tour narrates, a compact face floats
 * bottom-centre, above the controls; when a live voice/text conversation
 * connects, it grows and moves to centre-stage as the focal "person" you are
 * talking to. It is always pointer-events-none, so it never blocks clicks, and
 * it is skipped entirely under reduced-motion.
 */

const HEAD_COLOR = '#A78BFA';
const EYE_COLOR = '#00E5FF';
const MOUTH_COLOR = '#E3D095';

const EYE_CY = 0.34;
const EYE_DX = 0.4;
const EYE_R = 0.15;
const MOUTH_CY = -0.46;
const MOUTH_RX = 0.42;
const MOUTH_RY_CLOSED = 0.03;
const MOUTH_RY_OPEN = 0.5;

type FaceData = {
  geometry: BufferGeometry;
  rest: Float32Array; // base positions
  kind: Uint8Array; // 0 head, 1 eye, 2 mouth
  aux: Float32Array; // mouth: sin factor; eye: dy from centre; head: 0
  phase: Float32Array; // per-particle drift phase
};

function buildFace(tier: QualityTier): FaceData {
  const high = tier === 'high';
  const headCount = high ? 420 : 200;
  const eyeCount = high ? 80 : 40; // per eye
  const mouthCount = high ? 200 : 100;
  const total = headCount + eyeCount * 2 + mouthCount;

  const pos = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);
  const kind = new Uint8Array(total);
  const aux = new Float32Array(total);
  const phase = new Float32Array(total);

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
    phase[o] = Math.random() * Math.PI * 2;
    o++;
  };

  // Head — two faint elliptical rings suggesting a face, not filling it.
  for (let i = 0; i < headCount; i++) {
    const ang = (i / headCount) * Math.PI * 2;
    const ring = i % 2 === 0 ? 1 : 0.9;
    const x = Math.cos(ang) * 1.0 * ring + (Math.random() - 0.5) * 0.02;
    const y = Math.sin(ang) * 1.2 * ring + (Math.random() - 0.5) * 0.02;
    const z = (Math.random() - 0.5) * 0.14;
    put(x, y, z, head, 0, 0);
  }

  // Eyes — two small filled discs; aux = each point's dy from the eye centre.
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

  // Mouth — an ellipse outline; aux = sin(angle) so the vertical radius grows.
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
  return { geometry: geo, rest: pos.slice(), kind, aux, phase };
}

const Face: React.FC<{ tier: QualityTier }> = ({ tier }) => {
  const group = useRef<Group>(null);
  const points = useRef<Points>(null);
  const blink = useRef({ next: 1.5, until: 0 });
  const openRef = useRef(0);

  const { geometry, material, rest, kind, aux, phase } = useMemo(() => {
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
    return { geometry: face.geometry, material: mat, rest: face.rest, kind: face.kind, aux: face.aux, phase: face.phase };
  }, [tier]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { mouth: openness, speaking } = audioTourStore.get();

    openRef.current = MathUtils.lerp(openRef.current, openness, 0.4);
    const ry = MOUTH_RY_CLOSED + openRef.current * MOUTH_RY_OPEN;

    const b = blink.current;
    if (t > b.next && t > b.until) {
      b.until = t + 0.12;
      b.next = t + 2.6 + Math.random() * 3.6;
    }
    const blinkScale = t < b.until ? 0.12 : 1;

    // Livelier drift while speaking, but always moving — this is what makes the
    // dots feel like the W's cloud rather than a static picture.
    const drift = speaking ? 0.05 : 0.03;

    const obj = points.current;
    if (obj) {
      const arr = (obj.geometry.attributes.position as BufferAttribute).array as Float32Array;
      for (let i = 0; i < kind.length; i++) {
        const ph = phase[i];
        const dx = Math.sin(t * 0.9 + ph) * drift;
        const dy = Math.cos(t * 0.8 + ph * 1.3) * drift;
        const dz = Math.sin(t * 1.1 + ph * 0.7) * drift;
        const bx = rest[i * 3];
        const bz = rest[i * 3 + 2];
        arr[i * 3] = bx + dx;
        arr[i * 3 + 2] = bz + dz;
        if (kind[i] === 2) {
          arr[i * 3 + 1] = MOUTH_CY + ry * aux[i] + dy * 0.5;
        } else if (kind[i] === 1) {
          arr[i * 3 + 1] = EYE_CY + aux[i] * blinkScale + dy * 0.4;
        } else {
          arr[i * 3 + 1] = rest[i * 3 + 1] + dy;
        }
      }
      (obj.geometry.attributes.position as BufferAttribute).needsUpdate = true;
    }

    // Whole-cloud sway + a slow breathing scale — front-facing so the eyes and
    // mouth stay readable, but never still.
    if (group.current) {
      const energy = speaking ? 1 : 0.6;
      group.current.rotation.y = Math.sin(t * 0.4) * 0.35 * energy;
      group.current.rotation.x = Math.sin(t * 0.7 + 1) * 0.1 * energy;
      group.current.rotation.z = Math.sin(t * 0.3) * 0.04;
      const s = 1 + Math.sin(t * 1.2) * 0.02;
      group.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} material={material} />
    </group>
  );
};

type Mode = 'off' | 'guide' | 'call';

const HeadCanvas: React.FC<{ tier: QualityTier; mode: Mode }> = ({ tier, mode }) => {
  // Bottom-centre and compact while narrating; centre-stage and large on a call.
  const box =
    mode === 'call'
      ? 'top-[26%] h-64 w-64 sm:h-80 sm:w-80'
      : 'bottom-24 h-40 w-40 sm:bottom-28 sm:h-52 sm:w-52';
  return (
    <div
      className={`pointer-events-none fixed left-1/2 z-40 -translate-x-1/2 overflow-hidden rounded-full transition-all duration-500 ease-out ${box}`}
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
};

/**
 * Mount gate + placement mode. Shown while the narration tour is on OR a live
 * conversation is connected; `conversing` promotes it to the centre-stage size.
 */
const subscribe = (cb: () => void) => audioTourStore.subscribe(cb);
const getMode = (): Mode => {
  const s = audioTourStore.get();
  if (!s.active && !s.conversing) return 'off';
  return s.conversing ? 'call' : 'guide';
};

const TalkingHead: React.FC<{ tier: QualityTier }> = ({ tier }) => {
  const mode = useSyncExternalStore(subscribe, getMode, () => 'off' as Mode);
  const reduced = useMemo(() => getPrefersReducedMotion(), []);
  if (mode === 'off' || reduced) return null;
  return <HeadCanvas tier={tier} mode={mode} />;
};

export default TalkingHead;
