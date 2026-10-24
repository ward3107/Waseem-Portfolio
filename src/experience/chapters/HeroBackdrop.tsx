import React, { useEffect, useRef } from 'react';
import { scrollStore } from '../scrollStore';
import { CHAPTERS } from '../storyboard';

const HERO_SPAN = 1 / (CHAPTERS.length - 1);
const MOVE_END = HERO_SPAN * 0.6;
const FADE_START = HERO_SPAN * 0.5;
const FADE_END = HERO_SPAN * 0.72;

/** A lightweight V poster follows the opening scroll and yields to the 3D V. */
const HeroBackdrop: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const image = imageRef.current;
    if (!wrap || !image) return;

    const update = () => {
      const { journey } = scrollStore.get();
      const fade = journey <= FADE_START
        ? 1
        : journey >= FADE_END
          ? 0
          : 1 - (journey - FADE_START) / (FADE_END - FADE_START);
      wrap.style.opacity = String(Math.round(fade * 100) / 100);
      wrap.style.visibility = fade === 0 ? 'hidden' : 'visible';

      if (fade > 0) {
        const progress = Math.min(1, journey / MOVE_END);
        image.style.transform = `scale(${1 + progress * 0.12}) translateY(${-progress * 1.2}%)`;
      }
    };

    const unsubscribe = scrollStore.subscribe(update);
    update();
    return unsubscribe;
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <img
        ref={imageRef}
        src="/assets/forge-hero-v.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
      />
    </div>
  );
};

export default HeroBackdrop;
