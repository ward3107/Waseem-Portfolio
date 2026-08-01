import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TestimonialVideoProps {
  className?: string;
}

// Env-gated 30-second testimonial video slot. Set VITE_TESTIMONIAL_VIDEO_URL
// to any mp4/webm/youtube-embed URL and it renders as the first thing in
// the Reviews section. VITE_TESTIMONIAL_VIDEO_POSTER (optional) sets a
// poster frame for the native <video> element. If the URL env var is not
// set, the component renders nothing.
const TestimonialVideo: React.FC<TestimonialVideoProps> = ({ className = '' }) => {
  const { t } = useLanguage();
  const src = import.meta.env.VITE_TESTIMONIAL_VIDEO_URL;
  const poster = import.meta.env.VITE_TESTIMONIAL_VIDEO_POSTER;
  if (!src) return null;

  const isYoutube = /youtube\.com|youtu\.be/.test(src);

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <h3 className="text-sm sm:text-base font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-3 text-center">
        {t('testimonial_video_title')}
      </h3>
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-black">
        {isYoutube ? (
          <iframe
            src={src}
            title="Client testimonial"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full block"
          />
        ) : (
          <video
            src={src}
            controls
            preload="metadata"
            poster={poster || undefined}
            className="absolute inset-0 w-full h-full block object-cover"
          />
        )}
      </div>
    </div>
  );
};

export default TestimonialVideo;
