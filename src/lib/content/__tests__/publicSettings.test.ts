import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPublicSettings } from '@/lib/content/publicSettings';

vi.mock('@/lib/supabaseConfig', () => ({
  supabaseUrl: 'https://example.supabase.co',
  supabaseAnonKey: 'public-test-key',
}));

describe('public site settings read', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uses the existing anonymous read endpoint and returns its single row', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: true, whatsapp: '972544513141' }],
    });
    vi.stubGlobal('fetch', fetcher);
    expect((await getPublicSettings())?.whatsapp).toBe('972544513141');
    const [url, options] = fetcher.mock.calls[0];
    expect(url.toString()).toBe('https://example.supabase.co/rest/v1/site_settings?select=*&id=eq.true&limit=1');
    expect(options.headers).toMatchObject({ apikey: 'public-test-key', Authorization: 'Bearer public-test-key' });
  });

  it('keeps the caller fallback when the public read is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(getPublicSettings()).rejects.toThrow('503');
  });
});
