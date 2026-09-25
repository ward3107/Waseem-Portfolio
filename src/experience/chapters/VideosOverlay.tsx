import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { videoAdsCopy } from '@/features/video-ads/content';
import VideoReels from '@/features/video-ads/VideoReels';
import ChapterOverlay from './ChapterOverlay';
import HeadingAccent from '../components/HeadingAccent';
import { GhostNavButton } from './actions';

/** Video ads — the social reels right on the home page, so visitors don't
 *  have to find the /video-ads page to see them. Compact tap-to-play cards;
 *  the full case studies stay one click away. */
const VideosOverlay: React.FC<{ index: number; total: number }> = ({ index, total }) => {
  const { language } = useLanguage();
  const copy = videoAdsCopy[language];
  return (
    <ChapterOverlay
      index={index}
      total={total}
      title={<HeadingAccent tone="cyan">{copy.category}</HeadingAccent>}
      actions={<GhostNavButton href="/video-ads">{copy.explore}</GhostNavButton>}
    >
      <div className="mx-auto mt-8 w-full max-w-3xl">
        <VideoReels />
      </div>
    </ChapterOverlay>
  );
};

export default VideosOverlay;
