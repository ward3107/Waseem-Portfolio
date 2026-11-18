// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../../../../api/portfolio-stream.js';

const work = 'a1111111-b222-4333-8444-555555555555';
const uid = 'a'.repeat(32);
const owner = 'Bearer test-owner';
const headers = { authorization: owner };
const results = (data) => Response.json(data);

async function request(query, options = {}) {
  const response = {
    statusCode: 200,
    setHeader: vi.fn(),
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
    end() {
      return this;
    },
  };
  await handler(
    { method: 'GET', headers: {}, query: { work, uid, ...query }, ...options },
    response
  );
  return response;
}

describe('portfolio video service', () => {
  beforeEach(() => {
    vi.stubEnv('CLOUDFLARE_STREAM_ACCOUNT_ID', 'test-account');
    vi.stubEnv('CLOUDFLARE_STREAM_API_TOKEN', 'test-stream');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://db.example');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-public');
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  it('uses standard file uploads while optional provider credentials are absent', async () => {
    vi.stubEnv('CLOUDFLARE_STREAM_API_TOKEN', '');
    expect((await request({ action: 'capabilities' })).body).toEqual({ enabled: false });
    expect(fetch).not.toHaveBeenCalled();
  });
  it('only provisions an upload for the portfolio owner', async () => {
    const options = { method: 'POST', body: { work, size: 3145728, name: 'film.mp4' } };
    expect((await request({ action: 'create' }, options)).statusCode).toBe(401);
    fetch.mockResolvedValueOnce(results(false));
    expect((await request({ action: 'create' }, { ...options, headers })).statusCode).toBe(403);
    expect(fetch).toHaveBeenCalledTimes(1);
    fetch.mockResolvedValueOnce(results(true)).mockResolvedValueOnce(
      new Response(null, {
        status: 201,
        headers: {
          location: 'https://upload.cloudflarestream.com/tus/one',
          'stream-media-id': uid,
        },
      })
    );
    const upload = await request({ action: 'create' }, { ...options, headers });
    expect(upload.statusCode).toBe(201);
    expect(upload.body.uid).toBe(uid);
    expect(fetch.mock.calls.at(-1)[1].headers).toMatchObject({
      'Upload-Length': '3145728',
      'Upload-Creator': 'vasia-work-' + work,
      'Upload-Metadata': expect.stringContaining('requiresignedurls'),
    });
  });
  it('does not issue public playback for a draft or unreferenced video', async () => {
    fetch.mockResolvedValueOnce(results([]));
    const playback = await request({ action: 'play' }, { headers });
    expect(playback.statusCode).toBe(404);
    const [lookup, init] = fetch.mock.calls[0];
    expect(lookup.searchParams.get('published')).toBe('eq.true');
    expect(lookup.searchParams.get('video_path')).toBe('eq.stream:' + uid);
    expect(init.headers.Authorization).toBe('Bearer test-public');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('requires the matching work and a ready signed video before playback', async () => {
    const video = {
      creator: 'vasia-work-' + work,
      requireSignedURLs: true,
      readyToStream: true,
      playback: { hls: 'https://customer-demo.cloudflarestream.com/video/manifest/stream.m3u8' },
    };
    fetch
      .mockResolvedValueOnce(results(true))
      .mockResolvedValueOnce(results({ result: { ...video, creator: 'different-work' } }));
    expect((await request({ action: 'preview' }, { headers })).statusCode).toBe(404);
    fetch
      .mockResolvedValueOnce(results(true))
      .mockResolvedValueOnce(results({ result: { ...video, readyToStream: false } }));
    expect((await request({ action: 'check' }, { headers })).body).toEqual({ state: 'processing' });
    fetch
      .mockResolvedValueOnce(results([{ id: work }]))
      .mockResolvedValueOnce(results({ result: video }))
      .mockResolvedValueOnce(results({ result: { token: 'signed-playback' } }));
    expect((await request({ action: 'play' })).body).toEqual({
      iframe: 'https://customer-demo.cloudflarestream.com/signed-playback/iframe',
    });
  });
});
