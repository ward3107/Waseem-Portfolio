import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseRepoUrl, fetchRepoMeta } from '../github';

describe('parseRepoUrl', () => {
  it('parses a standard repo URL', () => {
    expect(parseRepoUrl('https://github.com/ward3107/Souvlaki')).toEqual({
      owner: 'ward3107', repo: 'Souvlaki',
    });
  });
  it('parses a URL with trailing .git and slash', () => {
    expect(parseRepoUrl('https://github.com/ward3107/Vocaband.git/')).toEqual({
      owner: 'ward3107', repo: 'Vocaband',
    });
  });
  it('returns null for a non-github URL', () => {
    expect(parseRepoUrl('https://example.com/x/y')).toBeNull();
  });
});

describe('fetchRepoMeta', () => {
  afterEach(() => vi.restoreAllMocks());

  it('maps the GitHub API response to form fields', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.endsWith('/languages')) {
        return { ok: true, json: async () => ({ TypeScript: 100, CSS: 20 }) } as Response;
      }
      return {
        ok: true,
        json: async () => ({ name: 'Souvlaki', description: 'A Greek site' }),
      } as Response;
    }));

    const meta = await fetchRepoMeta('https://github.com/ward3107/Souvlaki');
    expect(meta).toEqual({
      title: 'Souvlaki',
      description: 'A Greek site',
      tech: ['TypeScript', 'CSS'],
      github: 'https://github.com/ward3107/Souvlaki',
    });
  });

  it('returns null on a bad URL', async () => {
    expect(await fetchRepoMeta('not a url')).toBeNull();
  });
});
