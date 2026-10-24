import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const QuoteCalculator = lazy(() => import('./QuoteCalculator'));

/**
 * A full-width, opaque part of the homepage journey. Load the interactive
 * calculator as the visitor approaches it so its catalogue and form code do
 * not compete with the first hero paint.
 */
export default function InlineQuoteSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [nearby, setNearby] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (nearby || !sectionRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearby(true);
        observer.disconnect();
      }
    }, { rootMargin: '1200px 0px' });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [nearby]);

  return (
    <section id="quote-builder" ref={sectionRef} className="pointer-events-auto relative z-10 scroll-mt-16 bg-[#edf0f8] px-4 py-16 text-[#18203a] sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        {nearby ? (
          <Suspense fallback={<div className="min-h-[560px] animate-pulse rounded-[2rem] bg-white/80" aria-hidden="true" />}>
            <QuoteCalculator inline />
          </Suspense>
        ) : <div className="min-h-[560px]" aria-hidden="true" />}
      </div>
    </section>
  );
}
