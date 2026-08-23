import React from 'react';

/**
 * A horizontal, swipeable snap-carousel row — one line on any width (swipe on a
 * phone, scroll/drag on desktop) instead of a tall grid. Shared by the projects
 * and certifications chapters so both read as the same component. The scrollbar
 * is hidden; children provide their own fixed-width `snap-start` cards.
 */
const Carousel: React.FC<{ children: React.ReactNode; ariaLabel?: string }> = ({
  children,
  ariaLabel,
}) => (
  <div
    role="list"
    aria-label={ariaLabel}
    className="pointer-events-auto mt-8 flex w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    {children}
  </div>
);

export default Carousel;
