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
 * Motion policy: static. A gentle sway follows the pointer on hover; there is
 * NO auto-rotate loop, and the render loop parks itself (stops requesting
 * frames) once the letter has eased back to rest, so an idle logo costs zero
 * CPU/GPU — matching the "nothing that feels like a bug / no perpetual motion"
 * direction from the rest of the site.
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

    // Pointer-driven target rotation; the loop eases toward it and stops once
    // it's settled and the pointer has left.
    const targetRot = { x: 0, y: 0 };
    let rafId = 0;
    let running = false;

    const renderFrame = () => {
      group.rotation.y += (targetRot.y - group.rotation.y) * 0.08;
      group.rotation.x += (targetRot.x - group.rotation.x) * 0.08;
      renderer.render(scene, camera);
      const dy = Math.abs(targetRot.y - group.rotation.y);
      const dx = Math.abs(targetRot.x - group.rotation.x);
      // Keep animating until settled (within ~0.001 rad), then park the loop.
      if (dx > 0.001 || dy > 0.001) {
        rafId = requestAnimationFrame(renderFrame);
      } else {
        running = false;
      }
    };
    const kick = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(renderFrame);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetRot.y = nx * 0.6;
      targetRot.x = -ny * 0.4;
      kick();
    };
    const onPointerLeave = () => {
      targetRot.x = 0;
      targetRot.y = 0;
      kick();
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

    // Initial paint (single frame — no loop while idle).
    renderer.render(scene, camera);

    return () => {
      cancelAnimationFrame(rafId);
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
