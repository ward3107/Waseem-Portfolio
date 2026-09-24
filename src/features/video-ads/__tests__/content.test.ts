import { describe, expect, it } from 'vitest';
import { VIDEO_ADS } from '@/features/video-ads/content';

describe('video ads portfolio collection', () => {
  it('publishes both finished social-video case studies', () => {
    expect(VIDEO_ADS.map((project) => project.id)).toEqual([
      'greentouch',
      'ninnyo-friday',
    ]);
  });
});
