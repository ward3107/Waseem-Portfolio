import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => vi.restoreAllMocks());

describe('WebGL capability probe', () => {
  it('uses WebGL2, releases the probe context and caches the result', async () => {
    vi.resetModules();
    const loseContext = vi.fn();
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      getExtension: () => ({ loseContext }),
    } as unknown as WebGL2RenderingContext);
    const { detectWebGL } = await import('./useWebGLSupport');
    expect(detectWebGL()).toBe(true);
    expect(detectWebGL()).toBe(true);
    expect(getContext).toHaveBeenCalledExactlyOnceWith('webgl2');
    expect(loseContext).toHaveBeenCalledOnce();
  });
  it('rejects an unavailable context', async () => {
    vi.resetModules();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const { detectWebGL } = await import('./useWebGLSupport');
    expect(detectWebGL()).toBe(false);
  });
});
