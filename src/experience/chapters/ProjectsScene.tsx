import React, { useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Group, MathUtils, Mesh, MeshBasicMaterial, SRGBColorSpace } from 'three';
import { scrollStore } from '../scrollStore';
import { CHAPTERS } from '../storyboard';
import { useProjects } from '@/features/projects/useProjects';
import { safeHref } from '@/lib/safe';

const CARD_W = 2.4;
const CARD_H = 1.5;

// Turntable geometry: every project sits on a ring the camera faces. The ring
// steps one project at a time to the front, holds, then turns to the next — so
// each project settles front-and-centre in turn ("make them turn so I can see
// all of them"), where it enlarges, warms to brand cyan, and opens on click.
const RING_RADIUS = 3.2;
const RING_Z = -3.4; // ring centre; the front card sits ≈ z -0.2 (nearest camera)
const DWELL = 2.8; // seconds each project holds at the front before turning on

// Where the projects chapter sits on the *journey* timeline (the chapter-only
// axis the camera rig is keyed to, ignoring the ~15% footer), so the gallery
// peaks when the projects section fills the viewport and fades out before the
// neighbouring chapters — it never bleeds into the reviews beat.
const PROJECTS_CENTER =
  Math.max(0, CHAPTERS.findIndex((c) => c.id === 'projects')) / (CHAPTERS.length - 1);
const FOCUS_HALF = 0.12;

const BEZEL_ACTIVE = '#00E5FF';
const BEZEL_IDLE = '#0b1020';

/**
 * Chapter 4 showpiece — a 3D turntable of the real projects. Every project the
 * site knows about (Supabase-backed via useProjects — the full list, not a
 * hard-coded five) rides a ring the camera faces. The ring advances one slot at
 * a time so each project rotates to the front, holds a beat, then turns to the
 * next; the front screen enlarges and opens the live site on click. Hovering
 * pauses the turn so it is easy to click, and moving away resumes it.
 *
 * Interactivity is gated to when the projects chapter is actually in front of
 * the reader (focus high). That matters: the DOM layer above the canvas is
 * pointer-events-none, so a click on empty space falls through to the canvas —
 * if the whole ring were always clickable, a stray click in another section
 * would open a random project. Gating by focus keeps clicks meaningful only on
 * the projects beat; the DOM link index (ProjectsOverlay) still lists every
 * project by name for keyboard and crawler access.
 */
const ProjectsScene: React.FC = () => {
  const { projects } = useProjects();
  const images = useMemo(() => projects.map((p) => p.image), [projects]);
  const textures = useTexture(images);
  useMemo(() => {
    textures.forEach((tex) => {
      tex.colorSpace = SRGBColorSpace;
    });
  }, [textures]);

  const group = useRef<Group>(null);
  const items = useRef<(Group | null)[]>([]);
  const slot = useRef(0); // which project is currently turned to the front
  const nextAt = useRef(-1); // clock time to advance to the next project
  const paused = useRef(false); // hover pauses the turn so a card can be clicked
  const [live, setLive] = useState(false); // are clicks meaningful right now?
  const liveRef = useRef(false);

  // Even spacing of every project around the ring.
  const n = Math.max(1, projects.length);
  const step = (Math.PI * 2) / n;
  const angles = useMemo(() => projects.map((_, i) => i * ((Math.PI * 2) / n)), [projects, n]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const { journey } = scrollStore.get();
    const focus = MathUtils.clamp(1 - Math.abs(journey - PROJECTS_CENTER) / FOCUS_HALF, 0, 1);
    g.visible = focus > 0.005;

    // Flip interactivity (and re-render to attach/detach handlers) only when the
    // chapter crosses into / out of the readable zone — never every frame.
    const shouldLive = focus > 0.5;
    if (shouldLive !== liveRef.current) {
      liveRef.current = shouldLive;
      setLive(shouldLive);
      if (!shouldLive) paused.current = false;
    }
    if (!g.visible) return;

    // Step the turntable: hold each project for DWELL seconds, then advance.
    // A hover freezes the countdown so the reader can click the current one.
    const now = state.clock.elapsedTime;
    if (nextAt.current < 0) nextAt.current = now + DWELL;
    if (paused.current) nextAt.current = now + DWELL;
    else if (now >= nextAt.current) {
      slot.current += 1;
      nextAt.current = now + DWELL;
    }

    // Ease the ring so the current project sits dead-centre at the front.
    const targetSpin = -slot.current * step;
    const eased = 1 - Math.exp(-3.5 * delta);
    g.rotation.y = MathUtils.lerp(g.rotation.y, targetSpin, eased);
    g.position.y = MathUtils.lerp(g.position.y, 0.35 + (1 - focus) * -1.6, eased);

    // Per-card depth styling from how close it is to the front of the ring.
    const lift = 1 - Math.exp(-8 * delta);
    items.current.forEach((it, i) => {
      if (!it) return;
      const frontness = Math.cos(angles[i] + g.rotation.y); // 1 front, -1 back
      const tf = (frontness + 1) / 2; // 0…1
      const isFront = frontness > 0.86;

      it.scale.setScalar(MathUtils.lerp(it.scale.x, 0.6 + tf * tf * 0.62, lift));
      it.position.y = Math.sin(state.clock.elapsedTime * 0.6 + i) * 0.05;

      const bezel = (it.children[0] as Mesh | undefined)?.material as MeshBasicMaterial | undefined;
      const shot = (it.children[1] as Mesh | undefined)?.material as MeshBasicMaterial | undefined;
      // Back cards fade almost fully away so they don't clutter behind the front.
      const depth = tf * tf;
      if (shot) shot.opacity = focus * (0.05 + 0.95 * depth);
      if (bezel) {
        bezel.opacity = focus * (0.04 + 0.7 * depth);
        bezel.color.set(isFront ? BEZEL_ACTIVE : BEZEL_IDLE);
      }
    });
  });

  const openIfFront = (i: number, url: string) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const g = group.current;
    if (!g) return;
    // Only the screen actually facing the reader opens — a click on a
    // steeply-angled side card is ignored rather than opening the wrong project.
    if (Math.cos(angles[i] + g.rotation.y) < 0.3) return;
    // Open via a synthesized anchor click rather than window.open(): a click that
    // arrives through R3F's canvas handler doesn't reliably keep the user-gesture
    // activation window.open() needs, so the new tab gets blocked. A real <a>
    // click is treated as a genuine navigation (the same thing the DOM project
    // links do), and rel=noopener keeps it secure.
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const hover = (on: boolean) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    paused.current = on;
    document.body.style.cursor = on ? 'pointer' : 'auto';
  };

  return (
    <group ref={group} position={[0, 0, RING_Z]}>
      {projects.map((p, i) => {
        const a = angles[i];
        const href = safeHref(p.link);
        return (
          <group
            key={p.id}
            ref={(el) => (items.current[i] = el)}
            position={[Math.sin(a) * RING_RADIUS, 0, Math.cos(a) * RING_RADIUS]}
            rotation={[0, a, 0]}
            onPointerOver={live ? hover(true) : undefined}
            onPointerOut={live ? hover(false) : undefined}
            onClick={live && href ? openIfFront(i, href) : undefined}
          >
            {/* Bezel / drop shadow behind the screen (colour + fade per frame). */}
            <mesh position={[0, 0, -0.03]}>
              <planeGeometry args={[CARD_W + 0.16, CARD_H + 0.16]} />
              <meshBasicMaterial color={BEZEL_IDLE} transparent opacity={0} />
            </mesh>
            {/* The screenshot. */}
            <mesh>
              <planeGeometry args={[CARD_W, CARD_H]} />
              <meshBasicMaterial map={textures[i]} transparent opacity={0} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default ProjectsScene;
