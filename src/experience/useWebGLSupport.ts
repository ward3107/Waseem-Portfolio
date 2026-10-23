import { useState } from 'react';

/**
 * Probe once whether the browser can give us a WebGL context at all. Some
 * environments (locked-down browsers, blocklisted GPUs, headless crawlers,
 * or a machine that has already lost too many contexts) expose the API but
 * fail to create a context — so we actually try, then throw the probe canvas
 * away. Result is cached at module scope; the probe runs at most once per load.
 */
let cached: boolean | null = null;

function detectWebGL(): boolean {
  if (cached !== null) return cached;
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    // Three r170 requires WebGL2. Release the probe immediately so it does not
    // occupy one of the limited GPU contexts available on mobile Safari.
    const gl = canvas.getContext('webgl2');
    cached = Boolean(gl);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}

/**
 * Probe in the lazy state initializer so the first render selects the correct
 * homepage. Waiting for an effect briefly mounted the entire classic page,
 * including its large profile image, before replacing it with the experience.
 * That also delayed the experience chunk and its hero text by another render.
 */
export function useWebGLSupport(): boolean {
  const [supported] = useState<boolean>(detectWebGL);
  return supported;
}

export { detectWebGL };
