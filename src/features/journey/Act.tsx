import React from 'react';
import type { JourneyAct } from './journeyConfig';

/**
 * One act of the journey — a transparent wrapper around the feature section(s)
 * for that act. It carries the anchor id (for the rail + engine) and a
 * `data-act` hook the scroll engine reads to find act boundaries. It sets no
 * background of its own: the fixed journey ground shows through, which is the
 * whole point.
 *
 * No act-level fade: each act now holds several full-height sections, and those
 * sections already reveal their own content on scroll. Fading the whole
 * multi-thousand-pixel act as one unit was redundant and, on short viewports,
 * never crossed its own visibility threshold — which left the first act stuck
 * invisible on mobile. The soft act-to-act transitions live in the shared
 * backdrop instead (colour cross-fade + settle-beat in ScrollJourney).
 */
interface ActProps {
  act: JourneyAct;
  children: React.ReactNode;
}

const Act: React.FC<ActProps> = ({ act, children }) => (
  <div id={act.anchor} data-act={act.id} className="relative scroll-mt-24">
    {children}
  </div>
);

export default Act;
