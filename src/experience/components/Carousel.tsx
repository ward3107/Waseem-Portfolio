import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * A horizontal, swipeable snap-carousel row — one line on any width. On a phone
 * you swipe; on a pointer device (sm+) prev/next arrow buttons appear so there
 * is an obvious way to page through the row without a visible scrollbar or a
 * trackpad gesture (this was the "no way to go left/right on desktop" gap). The
 * arrows step ~one viewport of cards and hide at each end. The scrollbar is
 * hidden; children provide their own fixed-width `snap-start` cards.
 *
 * Direction handling: scrollBy({left}) moves content the same physical way in
 * both LTR and RTL on modern engines, so the left arrow always reveals content
 * on the left and the right arrow content on the right. Only the end-of-track
 * disabling is dir-aware, since "start" sits on the right in RTL.
 */
const Carousel: React.FC<{ children: React.ReactNode; ariaLabel?: string }> = ({
  children,
  ariaLabel,
}) => {
  const { t, dir } = useLanguage();
  const rtl = dir === 'rtl';
  const scroller = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // scrollLeft goes negative in RTL on modern engines — compare by magnitude.
    const pos = Math.abs(el.scrollLeft);
    setOverflowing(max > 4);
    setAtStart(pos <= 4);
    setAtEnd(pos >= max - 4);
  }, []);

  useEffect(() => {
    sync();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync, children]);

  // physical: -1 reveals content to the left, +1 to the right.
  const page = (physical: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: physical * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  // The left arrow reveals left-hand content: that is "toward start" in LTR but
  // "toward end" in RTL (start sits on the right), and vice-versa for the right.
  const leftDisabled = rtl ? atEnd : atStart;
  const rightDisabled = rtl ? atStart : atEnd;

  const arrowBase =
    'pointer-events-auto absolute top-1/2 z-10 hidden -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-slate-900/70 p-2 text-white shadow-lg backdrop-blur transition hover:border-brand-cyan/50 hover:bg-slate-900/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan disabled:pointer-events-none disabled:opacity-0 sm:grid';

  return (
    <div className="relative mt-8 w-full">
      {overflowing && (
        <>
          <button
            type="button"
            aria-label={t('aria_carousel_prev')}
            onClick={() => page(-1)}
            disabled={leftDisabled}
            className={`${arrowBase} -left-3`}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={t('aria_carousel_next')}
            onClick={() => page(1)}
            disabled={rightDisabled}
            className={`${arrowBase} -right-3`}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      )}
      <div
        ref={scroller}
        role="list"
        aria-label={ariaLabel}
        className="pointer-events-auto flex w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
};

export default Carousel;
