import { describe, expect, it } from 'vitest';
import { socialMediaCopy } from './content';
import { CHAPTERS } from '@/experience/storyboard';

describe('social media section', () => {
  it('provides complete localised content in all three site languages', () => {
    for (const language of ['he', 'en', 'ar'] as const) {
      const copy = socialMediaCopy[language];
      expect(copy.title).toBeTruthy();
      expect(copy.services).toHaveLength(3);
      expect(copy.formats).toHaveLength(4);
      expect(copy.prefill).toBeTruthy();
    }
  });
  it('places social after video ads and before reviews in the immersive journey', () => {
    const index = CHAPTERS.findIndex((chapter) => chapter.anchor === '#social-media');
    expect(CHAPTERS[index - 1].anchor).toBe('#video-ads');
    expect(CHAPTERS[index + 1].anchor).toBe('#reviews');
  });
});
