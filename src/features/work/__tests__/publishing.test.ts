import { describe, expect, it } from 'vitest';
import {
  blankWork,
  destinations,
  isLegacyAsset,
  publicationError,
  websiteUrl,
  workUrl,
} from '../model';

describe('portfolio publishing destinations', () => {
  it('routes a standalone work by type and requires a playable or visible deliverable', () => {
    const w = { ...blankWork(), title: 'Studio' };
    expect(publicationError(w)).toBeDefined();
    expect(websiteUrl('example.org')).toBe('https://example.org/');
    expect(publicationError({ ...w, website_url: 'example.org' })).toBeUndefined();
    expect(publicationError({ ...w, kind: 'album' })).toBeDefined();
    expect(publicationError({ ...w, kind: 'video' })).toBeDefined();
    expect(destinations({ ...w, kind: 'album' })).toEqual(['גלריית התמונות']);
    expect(websiteUrl('javascript:alert(1)')).toBeNull();
    expect(websiteUrl('https://example.org@other.example')).toBeNull();
  });
  it('attaches by default only to the selected project and previews deliberate extra placements', () => {
    const w = { ...blankWork('project/ninnyo-flowers'), kind: 'video' as const };
    expect(w.project_slug).toBe('ninnyo-flowers');
    expect(destinations(w, 'NINNYO')).toEqual(['עמוד הפרויקט NINNYO']);
    expect(destinations({ ...w, listed: true, featured: true }, 'NINNYO')).toEqual([
      'עמוד הפרויקט NINNYO',
      'סרטוני פרסום',
      'דף הבית',
    ]);
    expect(blankWork('work/example').parent_id).toBe('example');
  });
  it('keeps the share URL stable and only reuses local studio assets', () => {
    expect(workUrl('film-id', 'ar')).toBe('/work/film-id?lang=ar');
    expect(isLegacyAsset('/assets/video-ads/a.mp4')).toBe(true);
    expect(isLegacyAsset('/assets/video-ads/../private')).toBe(false);
    expect(isLegacyAsset('https://other.example/a.mp4')).toBe(false);
  });
});
