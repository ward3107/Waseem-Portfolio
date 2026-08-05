import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AmbientLight,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { FontLoader, type Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

/**
 * Brand "W" logo rendered in raw three.js — deliberately NOT using
 * @react-three/fiber or drei. Those pull the whole drei barrel (~220 KB gz)
 * for one static letter; hand-writing the ~90 lines here keeps the lazy chunk
 * to three-core only. Still code-split out of the main bundle via Logo3D's
 * dynamic import, so nothing here touches LCP.
 *
 * Motion policy: a slow, smooth Y-axis auto-rotate — the deliberate, premium
 * kind of motion (unlike the flashing borders removed elsewhere, which read as
 * bugs). Pointer hover adds a gentle tilt on top. Guarded so it stays cheap and
 * respectful:
 *   - transform-only (rotation), so it's GPU-cheap for one small mesh;
 *   - paused via IntersectionObserver whenever the hero is scrolled off-screen
 *     (no frames requested while it's not visible);
 *   - not rendered at all under prefers-reduced-motion (Logo3D shows the static
 *     CSS fallback there instead).
 */
const Logo3DScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [font, setFont] = useState<Font | null>(null);

  // Load the subsetted "W"-only typeface once.
  useEffect(() => {
    let active = true;
    new FontLoader().load('/fonts/logo-font.json', (f) => {
      if (active) setFont(f);
    });
    return () => {
      active = false;
    };
  }, []);

  const geometry = useMemo(() => {
    if (!font) return null;
    const geo = new TextGeometry('W', {
      font,
      size: 1.6,
      depth: 0.5,
      curveSegments: 8,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 4,
    });
    geo.center();
    return geo;
  }, [font]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !geometry) return;

    const width = mount.clientWidth || 200;
    const height = mount.clientHeight || 200;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);

    scene.add(new AmbientLight(0xffffff, 0.35));
    const key = new DirectionalLight(0xe3d095, 1.6); // warm gold key
    key.position.set(3, 4, 5);
    scene.add(key);
    const fill = new DirectionalLight(0x7965c1, 0.5); // purple fill
    fill.position.set(-4, -2, 2);
    scene.add(fill);

    const material = new MeshStandardMaterial({
      color: 0x7965c1,
      metalness: 0.55,
      roughness: 0.28,
    });
    const mesh = new Mesh(geometry, material);
    const group = new Group();
    group.add(mesh);
    scene.add(group);

    // Base auto-spin around Y, plus a pointer-driven tilt offset the mesh eases
    // toward. The spin runs continuously WHILE VISIBLE; an IntersectionObserver
    // stops the loop when the hero scrolls away so it costs nothing off-screen.
    const SPIN_SPEED = 0.35; // radians/sec — one full turn every ~18s (calm).
    let spin = 0;
    const tiltTarget = { x: 0, y: 0 };
    const tilt = { x: 0, y: 0 };
    let rafId = 0;
    let running = false;
    let lastTime = 0;

    const renderFrame = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      spin += SPIN_SPEED * dt;
      tilt.x += (tiltTarget.x - tilt.x) * 0.08;
      tilt.y += (tiltTarget.y - tilt.y) * 0.08;
      group.rotation.y = spin + tilt.y;
      group.rotation.x = tilt.x;
      renderer.render(scene, camera);
      if (running) rafId = requestAnimationFrame(renderFrame);
    };
    const start = () => {
      if (running) return;
      running = true;
      lastTime = 0;
      rafId = requestAnimationFrame(renderFrame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    // Only spin while the logo is actually on screen.
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              if (entries[0]?.isIntersecting) start();
              else stop();
            },
            { rootMargin: '100px' }
          )
        : null;
    if (io) io.observe(mount);
    else start(); // Fallback: no IO support → just run.

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      tiltTarget.y = nx * 0.6;
      tiltTarget.x = -ny * 0.4;
    };
    const onPointerLeave = () => {
      tiltTarget.x = 0;
      tiltTarget.y = 0;
    };

    const el = renderer.domElement;
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerleave', onPointerLeave);

    const onResize = () => {
      const w = mount.clientWidth || width;
      const h = mount.clientHeight || height;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    window.addEventListener('resize', onResize);

    // Initial paint so the letter shows before the first rAF (IO may start the
    // loop a tick later).
    renderer.render(scene, camera);

    return () => {
      stop();
      if (io) io.disconnect();
      window.removeEventListener('resize', onResize);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
      material.dispose();
      renderer.dispose();
      if (el.parentNode === mount) mount.removeChild(el);
    };
  }, [geometry]);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default Logo3DScene;
