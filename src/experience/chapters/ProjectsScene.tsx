import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Group, MathUtils, Mesh, MeshBasicMaterial, SRGBColorSpace } from 'three';
import { scrollStore } from '../scrollStore';
import { CHAPTERS } from '../storyboard';
import { useProjects } from '@/features/projects/useProjects';
import { safeHref } from '@/lib/safe';

const CARD_W = 2.4;
const CARD_H = 1.5;

// Turntable geometry: every project sits on a ring the camera faces.
const RING_RADIUS = 3.2;
const RING_Z = -3.4; // ring centre; the front card sits ≈ z -0.2 (nearest camera)
const DWELL = 2.8; // seconds a project holds at the front before auto-advancing
const DRAG_K = 0.006; // radians of spin per pixel dragged
const TAP_PX = 6; // movement under this counts as a tap (open), not a drag

// Where the projects chapter sits on the *journey* timeline (the chapter-only
// axis the camera rig is keyed to, ignoring the ~15% footer), so the gallery
// peaks when the projects section fills the viewport and fades out before the
// neighbouring chapters — it never bleeds into the reviews beat.
const PROJECTS_CENTER =
  Math.max(0, CHAPTERS.findIndex((c) => c.id === 'projects')) / (CHAPTERS.length - 1);
const FOCUS_HALF = 0.12;

const BEZEL_ACTIVE = '#00E5FF';
const BEZEL_IDLE = '#0b1020';

/** Open a URL in a new tab via a synthesized anchor click. A click arriving
 *  through R3F's canvas handler doesn't reliably keep the user-gesture
 *  activation window.open() needs (the tab gets blocked); a real <a> click is
 *  treated as a genuine navigation, the same as the DOM project links. */
const openInNewTab = (url: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/**
 * Chapter 4 showpiece — a 3D turntable of the real projects. Every project the
 * site knows about (Supabase-backed via useProjects — the full list, not a
 * hard-coded five) rides a ring the camera faces. It turns on its own, bringing
 * each project to front-centre in turn; the reader can also grab it — drag with
 * the mouse or swipe with a finger to spin left/right — and on release it snaps
 * the nearest project back to centre, so the front screen is always a clean tap
 * target. Tapping the front screen opens the live site; hovering pauses the turn.
 *
 * Interactivity is gated to when the projects chapter is actually in front of
 * the reader (focus high). That matters: the DOM layer above the canvas is
 * pointer-events-none, so a click on empty space falls through to the canvas —
 * gating by focus keeps drags/taps meaningful only on the projects beat and
 * stops a stray click elsewhere from opening a random project. The DOM link
 * index (ProjectsOverlay) still lists every project for keyboard/crawler access.
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
  const spin = useRef(0); // current ring rotation (radians)
  const target = useRef(0); // rotation the ring eases toward when not dragging
  const nextAdvance = useRef(-1); // clock time to auto-advance one project
  const snapPending = useRef(false); // a drag just ended → snap nearest to centre
  const hovering = useRef(false); // pointer resting on a card → pause the turn
  const dragging = useRef(false); // an active drag/swipe is spinning the ring
  const lastX = useRef(0);
  const moved = useRef(0);
  const downIndex = useRef(-1); // card the current press started on (-1 = empty)
  const [live, setLive] = useState(false); // is the chapter interactive right now?
  const liveRef = useRef(false);

  const n = Math.max(1, projects.length);
  const step = (Math.PI * 2) / n;
  const angles = useMemo(() => projects.map((_, i) => i * ((Math.PI * 2) / n)), [projects, n]);

  // Latest angles/urls for the window-level drag listeners (attached once, read
  // through refs rather than re-bound every render).
  const anglesRef = useRef(angles);
  anglesRef.current = angles;
  const urlsRef = useRef<(string | undefined)[]>([]);
  urlsRef.current = useMemo(() => projects.map((p) => safeHref(p.link)), [projects]);

  // Track the whole drag on window, so a swipe keeps spinning even if the pointer
  // slides off the card it started on; a press that barely moves is a tap → open.
  useEffect(() => {
    const onMove = (ev: PointerEvent) => {
      if (!dragging.current) return;
      const dx = ev.clientX - lastX.current;
      lastX.current = ev.clientX;
      moved.current += Math.abs(dx);
      spin.current -= dx * DRAG_K;
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      snapPending.current = true; // settle the nearest project back to centre
      const idx = downIndex.current;
      downIndex.current = -1;
      if (moved.current < TAP_PX && idx >= 0) {
        const g = group.current;
        const url = urlsRef.current[idx];
        // Only the screen actually facing the reader opens.
        if (g && url && Math.cos(anglesRef.current[idx] + g.rotation.y) >= 0.3) {
          openInNewTab(url);
        }
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const { journey } = scrollStore.get();
    const focus = MathUtils.clamp(1 - Math.abs(journey - PROJECTS_CENTER) / FOCUS_HALF, 0, 1);
    g.visible = focus > 0.005;

    const shouldLive = focus > 0.5;
    if (shouldLive !== liveRef.current) {
      liveRef.current = shouldLive;
      setLive(shouldLive);
      if (!shouldLive) {
        hovering.current = false;
        dragging.current = false;
      }
    }
    if (!g.visible) return;

    const now = state.clock.elapsedTime;
    if (nextAdvance.current < 0) nextAdvance.current = now + DWELL;

    if (dragging.current) {
      // The finger/mouse owns the rotation; don't ease or auto-advance.
      target.current = spin.current;
      nextAdvance.current = now + DWELL;
    } else {
      if (snapPending.current) {
        target.current = Math.round(spin.current / step) * step; // nearest project
        snapPending.current = false;
        nextAdvance.current = now + DWELL;
      }
      if (hovering.current) {
        nextAdvance.current = now + DWELL; // hold while the reader is on a card
      } else if (now >= nextAdvance.current) {
        target.current -= step; // turn one project on
        nextAdvance.current = now + DWELL;
      }
      spin.current = MathUtils.lerp(spin.current, target.current, 1 - Math.exp(-4 * delta));
    }
    g.rotation.y = spin.current;
    g.position.y = MathUtils.lerp(g.position.y, 0.35 + (1 - focus) * -1.6, 1 - Math.exp(-4 * delta));

    // Per-card depth styling from how close it is to the front of the ring.
    const lift = 1 - Math.exp(-8 * delta);
    items.current.forEach((it, i) => {
      if (!it) return;
      const frontness = Math.cos(angles[i] + g.rotation.y); // 1 front, -1 back
      const tf = (frontness + 1) / 2; // 0…1
      const depth = tf * tf;
      it.scale.setScalar(MathUtils.lerp(it.scale.x, 0.6 + depth * 0.62, lift));
      it.position.y = Math.sin(state.clock.elapsedTime * 0.6 + i) * 0.05;

      const bezel = (it.children[0] as Mesh | undefined)?.material as MeshBasicMaterial | undefined;
      const shot = (it.children[1] as Mesh | undefined)?.material as MeshBasicMaterial | undefined;
      if (shot) shot.opacity = focus * (0.05 + 0.95 * depth);
      if (bezel) {
        bezel.opacity = focus * (0.04 + 0.7 * depth);
        bezel.color.set(frontness > 0.86 ? BEZEL_ACTIVE : BEZEL_IDLE);
      }
    });
  });

  const startDrag = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    dragging.current = true;
    downIndex.current = i;
    lastX.current = e.nativeEvent.clientX;
    moved.current = 0;
  };
  const hover = (on: boolean) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hovering.current = on;
    document.body.style.cursor = on ? 'grab' : 'auto';
  };

  return (
    <group>
      {/* Invisible catcher behind the ring so a swipe on empty space also spins
          it (the cards, nearer the camera, still win taps/hover). */}
      <mesh
        position={[0, 0, RING_Z - RING_RADIUS - 1]}
        onPointerDown={live ? startDrag(-1) : undefined}
      >
        <planeGeometry args={[44, 26]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={group} position={[0, 0, RING_Z]}>
        {projects.map((p, i) => {
          const a = angles[i];
          return (
            <group
              key={p.id}
              ref={(el) => (items.current[i] = el)}
              position={[Math.sin(a) * RING_RADIUS, 0, Math.cos(a) * RING_RADIUS]}
              rotation={[0, a, 0]}
              onPointerDown={live ? startDrag(i) : undefined}
              onPointerOver={live ? hover(true) : undefined}
              onPointerOut={live ? hover(false) : undefined}
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
    </group>
  );
};

export default ProjectsScene;
