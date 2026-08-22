import React from 'react';
import { motion } from 'framer-motion';
import type { JourneyAct } from './journeyConfig';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

/**
 * One act of the journey — a transparent wrapper around the existing feature
 * section(s) for that act. It carries the anchor id (for the rail + engine) and
 * a `data-act` hook the scroll engine reads to find act boundaries. It sets no
 * background of its own: the fixed journey ground shows through, which is the
 * whole point. The inner sections keep their cards, blobs and copy untouched.
 *
 * As an act scrolls into view it does one soft cross-fade + rise, so each act
 * "arrives" as a whole. It triggers early (a good margin before centre) and
 * eases quickly, so the act is settled before the section's own staggered
 * content animates in — the two read as one arrival, not a double fade. Under
 * reduced motion it renders plain, fully visible, with no transform.
 */
interface ActProps {
  act: JourneyAct;
  children: React.ReactNode;
}

const Act: React.FC<ActProps> = ({ act, children }) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div id={act.anchor} data-act={act.id} className="relative scroll-mt-24">
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={act.anchor}
      data-act={act.id}
      className="relative scroll-mt-24"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default Act;
