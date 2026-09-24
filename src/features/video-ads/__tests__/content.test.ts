import { describe, expect, it } from 'vitest';
import { VIDEO_ADS } from '@/features/video-ads/content';

describe('video ads portfolio collection', () => {
  it('publishes every finished social-video case study', () => {
    expect(VIDEO_ADS.map((project) => project.id)).toEqual([
      'greentouch',
      'ninnyo-friday',
      'ninnyo-friday-12',
      'ninnyo-red-roses',
    ]);
  });
});
